import { Env } from './types';
import { handleAuth } from './auth';
import { handleCORS, requireAuth, corsHeaders } from './middleware';
import {
  getAliases,
  createAlias,
  updateAlias,
  deleteAlias,
  toggleAliasStatus,
  getRecipients,
  getDomains,
} from './addy';
import { 
  handleInitialize, 
  handleUpdateSettings, 
  handleCheckInitialization,
  getSettings 
} from './settings';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || env.ALLOWED_ORIGIN;

    const corsCheck = handleCORS(request, env);
    if (corsCheck) return corsCheck;

    try {
      const settings = await getSettings(env);
      
      if (url.pathname === '/initialize/check' && request.method === 'GET') {
        const response = await handleCheckInitialization(env);
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      if (url.pathname === '/initialize' && request.method === 'POST') {
        const response = await handleInitialize(request, env);
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      if (!settings?.initialized) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'NOT_INITIALIZED',
              message: 'System not initialized. Please complete setup first.',
            },
          }),
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(origin),
            },
          }
        );
      }

      const envWithSettings = {
        ...env,
        ADMIN_PASSWORD: settings.admin_password,
        ADDY_API_KEY: settings.addy_api_key,
        JWT_SECRET: settings.jwt_secret,
      };
      if (url.pathname === '/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            initialized: true,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(origin),
            },
          }
        );
      }

      if (url.pathname === '/auth' && request.method === 'POST') {
        const response = await handleAuth(request, envWithSettings);
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      }

      const authError = await requireAuth(request, envWithSettings);
      if (authError) {
        const headers = new Headers(authError.headers);
        Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
          headers.set(key, value);
        });
        return new Response(authError.body, {
          status: authError.status,
          headers,
        });
      }

      let response: Response;

      if (url.pathname === '/settings' && request.method === 'PATCH') {
        response = await handleUpdateSettings(request, env);
      } else if (url.pathname === '/aliases' && request.method === 'GET') {
        response = await getAliases(envWithSettings);
      } else if (url.pathname === '/aliases' && request.method === 'POST') {
        response = await createAlias(request, envWithSettings);
      } else if (url.pathname.match(/^\/aliases\/[^/]+$/) && request.method === 'PATCH') {
        const aliasId = url.pathname.split('/')[2];
        response = await updateAlias(aliasId, request, envWithSettings);
      } else if (url.pathname.match(/^\/aliases\/[^/]+$/) && request.method === 'DELETE') {
        const aliasId = url.pathname.split('/')[2];
        response = await deleteAlias(aliasId, envWithSettings);
      } else if (url.pathname.match(/^\/aliases\/[^/]+\/enable$/) && request.method === 'POST') {
        const aliasId = url.pathname.split('/')[2];
        response = await toggleAliasStatus(aliasId, true, envWithSettings);
      } else if (url.pathname.match(/^\/aliases\/[^/]+\/disable$/) && request.method === 'POST') {
        const aliasId = url.pathname.split('/')[2];
        response = await toggleAliasStatus(aliasId, false, envWithSettings);
      } else if (url.pathname === '/recipients' && request.method === 'GET') {
        response = await getRecipients(envWithSettings);
      } else if (url.pathname === '/domains' && request.method === 'GET') {
        response = await getDomains(envWithSettings);
      } else {
        response = new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Endpoint not found',
            },
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const headers = new Headers(response.headers);
      Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin),
          },
        }
      );
    }
  },
};
