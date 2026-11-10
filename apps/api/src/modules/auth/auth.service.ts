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

  async syncClerkUser(clerkUser: {
    id: string;
    phone: string;
    fullName: string;
    email?: string;
    avatarUrl?: string;
    district?: string;
    locality?: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: clerkUser.phone }, ...(clerkUser.email ? [{ email: clerkUser.email }] : [])],
      },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash(`clerk_oauth_${Date.now()}`, 10);
      user = await this.prisma.user.create({
        data: {
          fullName: clerkUser.fullName || 'Citizen',
          phone: clerkUser.phone || `clerk_${clerkUser.id}`,
          email: clerkUser.email,
          avatarUrl: clerkUser.avatarUrl,
          passwordHash: dummyPassword,
          district: clerkUser.district || 'Ernakulam',
          locality: clerkUser.locality || 'Kakkanad',
          isVerified: true,
          role: Role.CITIZEN,
        },
      });
      this.logger.log(`Synced new user from Clerk: ${user.fullName} (${user.id})`);
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), tokens };
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

