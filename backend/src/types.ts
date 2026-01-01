export interface Env {
  ADMIN_PASSWORD: string;
  ADDY_API_KEY: string;
  JWT_SECRET: string;
  ALLOWED_ORIGIN: string;
  SETTINGS: KVNamespace;
}

export interface Alias {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
  recipients: Array<{ email: string; id: string }>;
}

export interface CreateAliasRequest {
  local_part?: string;
  domain?: string;
  description?: string;
  recipient_ids?: string[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}
