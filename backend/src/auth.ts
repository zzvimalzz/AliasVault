import { Env, AuthResponse } from './types';

const LOGIN_ATTEMPTS = new Map<string, { count: number; resetAt: number }>();

export function validatePassword(password: string, correctPassword: string): boolean {
  return password === correctPassword;
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = LOGIN_ATTEMPTS.get(ip);

  if (!attempts || now > attempts.resetAt) {
    LOGIN_ATTEMPTS.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 });
    return true;
  }

  return attempts.count < 5;
}

export function recordFailedAttempt(ip: string): void {
  const attempts = LOGIN_ATTEMPTS.get(ip);
  if (attempts) {
    attempts.count++;
  }
}

export async function generateToken(env: Env): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    iss: 'aliasvault',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const encoder = new TextEncoder();
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '');
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const data = `${headerBase64}.${payloadBase64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');

  return `${data}.${signatureBase64}`;
}

export async function verifyToken(token: string, env: Env): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;

    const encoder = new TextEncoder();
    const data = `${parts[0]}.${parts[1]}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = new Uint8Array(
      atob(parts[2])
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    return await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
  } catch {
    return false;
  }
}

export async function handleAuth(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const { password } = body as { password: string };

    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many failed attempts. Please try again later.',
          },
        } as AuthResponse),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validatePassword(password, env.ADMIN_PASSWORD)) {
      recordFailedAttempt(clientIP);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid password',
          },
        } as AuthResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = await generateToken(env);

    return new Response(
      JSON.stringify({
        success: true,
        token,
      } as AuthResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication failed',
        },
      } as AuthResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
