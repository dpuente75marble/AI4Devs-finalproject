import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  DEFAULT_AUTH_COOKIE_NAME,
  INVALID_CREDENTIALS_MESSAGE,
  LOGIN_SUCCESS_MESSAGE,
  LOGOUT_SUCCESS_MESSAGE,
} from './auth.constants';
import { AuthService } from './auth.service';
import { LoginRequestDto, validateLoginRequest } from './dto/login-request.dto';
import { LoginResponseDto, LogoutResponseDto } from './dto/login-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './types/authenticated-request';
import { getAuthCookieOptions } from './utils/auth-config.utils';
import { clearAuthCookie, setAuthCookie } from './utils/auth-cookie.utils';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiOkResponse({
    description:
      'Login successful. Session JWT is set in an HttpOnly cookie; not returned in JSON.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid login request body' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    validateLoginRequest(body);

    try {
      const result = await this.authService.login(body.email, body.password);
      const token = this.jwtService.sign({ sub: result.user.id });
      setAuthCookie(res, token, getAuthCookieOptions(this.configService));

      return {
        user: result.user,
        message: LOGIN_SUCCESS_MESSAGE,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
      }

      throw error;
    }
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Clear session cookie' })
  @ApiOkResponse({
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  logout(@Res({ passthrough: true }) res: Response): LogoutResponseDto {
    clearAuthCookie(res, getAuthCookieOptions(this.configService));

    return {
      message: LOGOUT_SUCCESS_MESSAGE,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth(DEFAULT_AUTH_COOKIE_NAME)
  @ApiOperation({
    summary: 'Get current authenticated user',
    description:
      'Requires a valid session cookie (HttpOnly). The JWT is read from the cookie, not from Authorization Bearer.',
  })
  @ApiOkResponse({
    description:
      'Current authenticated user loaded from PostgreSQL via JWT sub',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Missing, invalid or expired session cookie, or user not found',
  })
  async me(@Req() req: AuthenticatedRequest): Promise<MeResponseDto> {
    const user = await this.authService.getMe(req.user.userId);

    return { user };
  }
}
