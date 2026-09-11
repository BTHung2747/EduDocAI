import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('keeps a newly registered account when default subject creation fails', async () => {
    const user = { id: '11111111-1111-4111-8111-111111111111', email: 'student@example.com', displayName: 'Student', role: 'USER' };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(user) },
      $transaction: jest.fn().mockRejectedValue(new Error('subject profile failure')),
    };
    const service = new AuthService(prisma as never, {} as never, {} as never);

    await expect(service.register({ email: user.email, password: 'mat-khau-123', confirmPassword: 'mat-khau-123', displayName: user.displayName })).resolves.toEqual(user);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('does not disclose whether an email exists when requesting a reset', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new AuthService(prisma as never, {} as never, {} as never);

    await expect(service.requestPasswordReset('missing@example.com')).resolves.toBeUndefined();
  });

  it('rejects an invalid reset token', async () => {
    const prisma = { passwordResetToken: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new AuthService(prisma as never, {} as never, {} as never);

    await expect(service.resetPassword('invalid', 'mat-khau-moi')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
