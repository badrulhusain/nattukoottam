import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.phone }, ...(dto.email ? [{ email: dto.email }] : [])],
      },
    });

    if (existing) {
      throw new ConflictException({
        code: 'USER_EXISTS',
        message: 'A user with this phone number or email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        district: dto.district,
        locality: dto.locality,
        role: dto.role || Role.CITIZEN,
        preferredLang: dto.preferredLang || 'ml',
      },
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.identifier }, { email: dto.identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid phone/email or password',
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid phone/email or password',
      });
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'naatukoottam-jwt-refresh-secret-key-kerala-2026',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException({ code: 'TOKEN_INVALID', message: 'Invalid refresh token' });
      }

      const isMatch = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException({ code: 'TOKEN_REVOKED', message: 'Refresh token has been revoked' });
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException({ code: 'TOKEN_EXPIRED', message: 'Refresh token expired' });
    }
  }

  async syncClerkUser(dto: {
    clerkId?: string;
    id?: string;
    email?: string;
    phone?: string;
    fullName?: string;
    avatarUrl?: string;
    district?: string;
    locality?: string;
  }) {
    const targetId = dto.clerkId || dto.id;
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(targetId ? [{ id: targetId }] : []),
          ...(dto.email ? [{ email: dto.email }] : []),
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: dto.fullName || user.fullName,
          avatarUrl: dto.avatarUrl || user.avatarUrl,
          email: dto.email || user.email,
        },
      });
      this.logger.log(`Synced existing user with Clerk: ${user.fullName} (${user.id})`);
    } else {
      const safeId = targetId || `clerk_${Date.now()}`;
      const safePhone = dto.phone || `clerk_${safeId}`;
      const safeFullName = dto.fullName || dto.email?.split('@')[0] || 'Community Citizen';
      user = await this.prisma.user.create({
        data: {
          id: safeId,
          fullName: safeFullName,
          email: dto.email,
          phone: safePhone,
          passwordHash: 'CLERK_MANAGED_AUTH',
          avatarUrl: dto.avatarUrl,
          district: dto.district || 'Ernakulam',
          locality: dto.locality || 'Kakkanad',
          role: Role.CITIZEN,
          isVerified: true,
        },
      });
      this.logger.log(`Created new user from Clerk: ${user.fullName} (${user.id})`);
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async updateLocation(userId: string, dto: { locality: string; district: string; wardNumber?: number }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        locality: dto.locality,
        district: dto.district,
        ...(dto.wardNumber !== undefined ? { wardNumber: dto.wardNumber } : {}),
      },
    });
    this.logger.log(`Updated user ${userId} saved location to ${dto.locality}, ${dto.district}`);
    return this.sanitizeUser(updated);
  }

  async updateProfile(
    userId: string,
    dto: {
      fullName?: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
      locality?: string;
      district?: string;
      wardNumber?: number;
      preferredLang?: string;
    }
  ) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName ? { fullName: dto.fullName } : {}),
        ...(dto.email !== undefined ? { email: dto.email || null } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.locality ? { locality: dto.locality } : {}),
        ...(dto.district ? { district: dto.district } : {}),
        ...(dto.wardNumber !== undefined ? { wardNumber: dto.wardNumber } : {}),
        ...(dto.preferredLang ? { preferredLang: dto.preferredLang } : {}),
      },
    });
    this.logger.log(`Updated profile for user ${userId} (${updated.fullName})`);
    return this.sanitizeUser(updated);
  }



  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      district: user.district,
      locality: user.locality,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'naatukoottam-jwt-secret-key-kerala-2026',
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'naatukoottam-jwt-refresh-secret-key-kerala-2026',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: '1d',
    };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  private sanitizeUser(user: User) {
    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }
}

