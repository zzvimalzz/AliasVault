export interface Alias {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
  recipients: Array<{
    id: string;
    email: string;
  }>;
}

export interface AliasMetadata {
  service?: string;
  category?: string;
  risk?: 'low' | 'medium' | 'high';
  notes?: string;
  tags?: string[];
  color?: string;
  created_by_user?: string;
  url?: string;
}

export interface Recipient {
  id: string;
  email: string;
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

export interface CreateAliasRequest {
  local_part?: string;
  domain?: string;
  description?: string;
  recipient_ids?: string[];
}

export type ViewMode = 'table' | 'graph';
