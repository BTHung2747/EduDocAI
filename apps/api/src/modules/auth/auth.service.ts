import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '../../generated/prisma';
import argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import type { AuthTokens, AuthenticatedUser, LoginInput, RegisterInput } from '@edudocs/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { ensureDefaultSubjects } from '../subjects/default-subjects.service';

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload extends AccessTokenPayload {
  sid: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: RegisterInput): Promise<AuthenticatedUser> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({ code: 'EMAIL_ALREADY_REGISTERED', message: 'Email này đã được sử dụng.' });
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await argon2.hash(input.password),
        displayName: input.displayName.trim(),
      },
    });
    try {
      await ensureDefaultSubjects(this.prisma, user.id);
    } catch {
      this.logger.warn('Default subject profiles could not be created for a new user');
    }
    return this.publicUser(user);
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.trim().toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, input.password)) || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng.' });
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    });
    const now = new Date();
    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= now ||
      session.user.status !== UserStatus.ACTIVE ||
      !(await argon2.verify(session.tokenHash, refreshToken))
    ) {
      throw new UnauthorizedException({ code: 'INVALID_SESSION', message: 'Phiên đăng nhập đã hết hạn.' });
    }

    await this.prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: now } });
    return this.issueTokens(session.user);
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      await this.prisma.refreshSession.updateMany({
        where: { id: payload.sid, userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Logout is intentionally idempotent and does not disclose token validity.
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return;

    const rawToken = randomBytes(32).toString('base64url');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashOpaqueToken(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    // M0 has no mail provider. A delivery adapter will receive the raw token in a later milestone.
  }

  async resetPassword(rawToken: string, password: string): Promise<void> {
    const tokenHash = this.hashOpaqueToken(rawToken);
    const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      throw new UnauthorizedException({ code: 'INVALID_RESET_TOKEN', message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: await argon2.hash(password) } }),
      this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
      this.prisma.refreshSession.updateMany({ where: { userId: resetToken.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  }

  private async issueTokens(user: { id: string; email: string; displayName: string; role: string }) {
    const expiresAt = new Date(Date.now() + this.config.getOrThrow<number>('JWT_REFRESH_TTL_DAYS') * 86_400_000);
    const session = await this.prisma.refreshSession.create({
      data: { userId: user.id, tokenHash: 'pending', expiresAt },
    });
    const payload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.getOrThrow<number>('JWT_ACCESS_TTL_SECONDS'),
    });
    const refreshToken = await this.jwt.signAsync({ ...payload, sid: session.id }, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${this.config.getOrThrow<number>('JWT_REFRESH_TTL_DAYS')}d`,
    });
    await this.prisma.refreshSession.update({
      where: { id: session.id },
      data: { tokenHash: await argon2.hash(refreshToken) },
    });
    return { accessToken, refreshToken, user: this.publicUser(user) };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwt.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException({ code: 'INVALID_SESSION', message: 'Phiên đăng nhập không hợp lệ.' });
    }
  }

  private hashOpaqueToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private publicUser(user: { id: string; email: string; displayName: string; role: string }): AuthenticatedUser {
    return { id: user.id, email: user.email, displayName: user.displayName, role: user.role as AuthenticatedUser['role'] };
  }
}
