import { describe, expect, it } from 'vitest';
import { apiUrl } from './api-url';

describe('apiUrl', () => {
  it('prefixes a relative API route with the versioned API base', () => {
    expect(apiUrl('/auth/login')).toBe('http://localhost:3001/api/v1/auth/login');
  });
});
