import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
} from '@edudocs/contracts';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';

const refreshCookieName = 'edudocs_refresh';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(new ZodValidationPipe(registerSchema)) input: RegisterInput) {
    const user = await this.authService.register(input);
    return { data: user };
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) input: LoginInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(input);
    this.setRefreshCookie(response, result.refreshToken);
    return { data: { accessToken: result.accessToken, user: result.user } };
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.[refreshCookieName] as string | undefined;
    if (!refreshToken) throw new UnauthorizedException({ message: 'Phiên đăng nhập không hợp lệ.' });

    const result = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(response, result.refreshToken);
    return { data: { accessToken: result.accessToken, user: result.user } };
  }

  @HttpCode(204)
  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.[refreshCookieName] as string | undefined;
    if (refreshToken) await this.authService.logout(refreshToken);
    response.clearCookie(refreshCookieName, { path: '/api/v1/auth' });
  }

  @HttpCode(202)
  @Post('forgot-password')
  async forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) input: { email: string }) {
    await this.authService.requestPasswordReset(input.email);
    return { data: { message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' } };
  }

  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body(new ZodValidationPipe(resetPasswordSchema)) input: { token: string; password: string }) {
    await this.authService.resetPassword(input.token, input.password);
    return { data: { message: 'Mật khẩu đã được cập nhật.' } };
  }

  private setRefreshCookie(response: Response, token: string) {
    response.cookie(refreshCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
