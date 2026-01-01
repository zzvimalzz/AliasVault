function getWorkerUrl(): string {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8787';
  }
  
  const username = window.location.hostname.split('.')[0];
  
  return `https://aliasvault-api-${username}.workers.dev`;
}

const API_URL = import.meta.env.VITE_API_URL || getWorkerUrl();

export function getToken(): string | null {
  return sessionStorage.getItem('token');
}

export function setToken(token: string): void {
  sessionStorage.setItem('token', token);
}

export function clearToken(): void {
  sessionStorage.clear();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token && endpoint !== '/auth') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
}

export const api = {
  setToken,

  async checkInitialization() {
    const response = await fetch(`${API_URL}/initialize/check`);
    const data = await response.json();
    return data.data;
  },

  async initialize(data: any) {
    const response = await fetch(`${API_URL}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Initialization failed');
    }

    return result.data;
  },

  async login(password: string) {
    const response = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }

    if (data.token) {
      setToken(data.token);
    }

    return data;
  },

  async getAliases() {
    return request('/aliases');
  },

  async createAlias(data: any) {
    return request('/aliases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAlias(id: string, data: any) {
    return request(`/aliases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteAlias(id: string) {
    return request(`/aliases/${id}`, {
      method: 'DELETE',
    });
  },

  async enableAlias(id: string) {
    return request(`/aliases/${id}/enable`, {
      method: 'POST',
    });
  },

  async disableAlias(id: string) {
    return request(`/aliases/${id}/disable`, {
      method: 'POST',
    });
  },

  async getRecipients() {
    return request('/recipients');
  },

  async getDomains() {
    return request('/domains');
  },

  async updateSettings(data: any) {
    return request('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async checkHealth() {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
  },
};
