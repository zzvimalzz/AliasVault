import { Env } from './types';
import { verifyToken } from './auth';

export function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCORS(request: Request, env: Env): Response | null {
  const origin = request.headers.get('Origin');
  
  if (!origin) {
    return new Response('CORS: No origin header', { status: 403 });
  }
  
  const isGitHubPages = origin.endsWith('.github.io');
  const isLocalhost = origin.includes('localhost');
  const isAllowed = origin === env.ALLOWED_ORIGIN || isGitHubPages || isLocalhost;
  
  if (!isAllowed) {
    return new Response('CORS: Origin not allowed', { status: 403 });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  return null;
}

export async function requireAuth(request: Request, env: Env): Promise<Response | null> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Missing or invalid authorization header',
        },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.substring(7);
  const isValid = await verifyToken(token, env);

  if (!isValid) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token is invalid or expired',
        },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null;
}
