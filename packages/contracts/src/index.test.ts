import { describe, expect, it } from 'vitest';
import { registerSchema } from './index.js';

describe('registerSchema', () => {
  it('normalizes an email and validates confirmation', () => {
    const result = registerSchema.parse({
      email: '  STUDENT@Example.COM ',
      password: 'mat-khau-8',
      confirmPassword: 'mat-khau-8',
      displayName: 'Sinh viên',
    });

    expect(result.email).toBe('student@example.com');
  });
});
