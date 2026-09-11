const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function apiUrl(path: string) {
  return new URL(path.replace(/^\//, ''), `${baseUrl}/`).toString();
}
