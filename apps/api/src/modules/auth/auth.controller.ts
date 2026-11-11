import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new Citizen or Official account' })
  @ApiResponse({ status: 201, description: 'User registered successfully with JWT tokens' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with phone/email and password' })
  @ApiResponse({ status: 200, description: 'JWT Access and Refresh tokens' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh expired access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Get currently authenticated user profile' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('location')
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Update and save user location in account profile' })
  async updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: { locality: string; district: string; wardNumber?: number }
  ) {
    return this.authService.updateLocation(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth('bearer-jwt')
  @ApiOperation({ summary: 'Update user profile info' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body()
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
    return this.authService.updateProfile(userId, dto);
  }

  @Public()
  @Post('clerk-sync')
  @ApiOperation({ summary: 'Synchronize a user authenticated via Clerk with Neon database' })
  async syncClerkUser(@Body() body: any) {
    return this.authService.syncClerkUser(body);
  }
}

