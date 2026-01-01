import { Env, Alias, CreateAliasRequest, ApiResponse } from './types';

const ADDY_BASE_URL = 'https://app.addy.io/api/v1';

async function addyRequest(
  endpoint: string,
  env: Env,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    'Authorization': `Bearer ${env.ADDY_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  return fetch(`${ADDY_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

export async function getAliases(env: Env): Promise<Response> {
  try {
    const response = await addyRequest('/aliases', env);
    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ADDY_API_ERROR',
            message: 'Failed to fetch aliases',
            details: data.message || 'Unknown error',
          },
        } as ApiResponse),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data.data,
      } as ApiResponse<Alias[]>),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch aliases',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function createAlias(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as CreateAliasRequest;
    
    const addyPayload: any = {};
    if (body.local_part && body.local_part.trim() !== '') addyPayload.local_part = body.local_part;
    if (body.domain) addyPayload.domain = body.domain;
    if (body.description) addyPayload.description = body.description;
    if (body.recipient_ids && body.recipient_ids.length > 0) {
      addyPayload.recipient_ids = body.recipient_ids;
    }
    
    const response = await addyRequest('/aliases', env, {
      method: 'POST',
      body: JSON.stringify(addyPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ADDY_API_ERROR',
            message: 'Failed to create alias',
            details: data.message || 'Unknown error',
          },
        } as ApiResponse),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data.data,
      } as ApiResponse<Alias>),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create alias',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function updateAlias(aliasId: string, request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    
    const response = await addyRequest(`/aliases/${aliasId}`, env, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ADDY_API_ERROR',
            message: 'Failed to update alias',
            details: data.message || 'Unknown error',
          },
        } as ApiResponse),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data.data,
      } as ApiResponse<Alias>),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update alias',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function deleteAlias(aliasId: string, env: Env): Promise<Response> {
  try {
    const response = await addyRequest(`/aliases/${aliasId}`, env, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ADDY_API_ERROR',
            message: 'Failed to delete alias',
            details: data.message || 'Unknown error',
          },
        } as ApiResponse),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      } as ApiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete alias',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function toggleAliasStatus(aliasId: string, active: boolean, env: Env): Promise<Response> {
  try {
    const endpoint = active 
      ? `/active-aliases/${aliasId}` 
      : `/active-aliases/${aliasId}`;
    
    const response = await addyRequest(endpoint, env, {
      method: active ? 'POST' : 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ADDY_API_ERROR',
            message: `Failed to ${active ? 'enable' : 'disable'} alias`,
            details: data.message || 'Unknown error',
          },
        } as ApiResponse),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data.data,
      } as ApiResponse<Alias>),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Failed to ${active ? 'enable' : 'disable'} alias`,
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function getRecipients(env: Env): Promise<Response> {
  try {
    const response = await addyRequest('/recipients', env);
    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ADDY_API_ERROR',
            message: 'Failed to fetch recipients',
            details: data.message || 'Unknown error',
          },
        } as ApiResponse),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data.data,
      } as ApiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch recipients',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
export async function getDomains(env: Env): Promise<Response> {
  try {
    const response = await addyRequest('/domains', env);
    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ADDY_API_ERROR',
            message: 'Failed to fetch domains',
            details: data.message || 'Unknown error',
          },
        } as ApiResponse),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data.data,
      } as ApiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch domains',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}