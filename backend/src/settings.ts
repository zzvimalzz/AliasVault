import { Env, ApiResponse } from './types';
import { generateToken } from './auth';

export interface Settings {
  admin_password: string;
  addy_api_key: string;
  jwt_secret: string;
  initialized: boolean;
}

export async function getSettings(env: Env): Promise<Settings | null> {
  try {
    const data = await env.SETTINGS.get('config');
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveSettings(env: Env, settings: Settings): Promise<void> {
  await env.SETTINGS.put('config', JSON.stringify(settings));
}

export async function handleInitialize(request: Request, env: Env): Promise<Response> {
  try {
    const existingSettings = await getSettings(env);
    
    if (existingSettings?.initialized) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'ALREADY_INITIALIZED',
            message: 'System already initialized',
          },
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { admin_password, addy_api_key, jwt_secret } = body as {
      admin_password: string;
      addy_api_key: string;
      jwt_secret?: string;
    };

    if (!admin_password || !addy_api_key) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'admin_password and addy_api_key are required',
          },
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const generatedSecret = jwt_secret || generateRandomSecret();

    const settings: Settings = {
      admin_password,
      addy_api_key,
      jwt_secret: generatedSecret,
      initialized: true,
    };

    await saveSettings(env, settings);

    const mockEnv = {
      ...env,
      ADMIN_PASSWORD: admin_password,
      JWT_SECRET: generatedSecret,
    };

    const token = await generateToken(mockEnv);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: 'System initialized successfully',
          token,
        },
      } as ApiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to initialize system',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleUpdateSettings(request: Request, env: Env): Promise<Response> {
  try {
    const settings = await getSettings(env);
    
    if (!settings?.initialized) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'NOT_INITIALIZED',
            message: 'System not initialized',
          },
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { admin_password, addy_api_key, jwt_secret } = body as Partial<Settings>;

    const updatedSettings: Settings = {
      ...settings,
      admin_password: admin_password || settings.admin_password,
      addy_api_key: addy_api_key || settings.addy_api_key,
      jwt_secret: jwt_secret || settings.jwt_secret,
    };

    await saveSettings(env, updatedSettings);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: 'Settings updated successfully',
        },
      } as ApiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update settings',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleCheckInitialization(env: Env): Promise<Response> {
  try {
    const settings = await getSettings(env);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          initialized: settings?.initialized || false,
        },
      } as ApiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check initialization',
        },
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function generateRandomSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < 32; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}
