/**
 * Hind DB - Auth API Client
 * Company: Hind India Private Limited
 * Product: Hind DB (hind.io)
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 */

const API_BASE = '/auth';

export interface User {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  email_verified?: boolean;
  emailVerified?: boolean;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  role?: string;
  mfaEnabled?: boolean;
  mfa_enabled?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    accessToken?: string;
    user?: User;
  };
}

// In-memory access token storage (NEVER in localStorage for security)
let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

export function getInMemoryAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setInMemoryAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Universal authenticated API fetch wrapper
 * Attaches in-memory Bearer token and automatically handles 401 token refresh retry
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = endpoint.startsWith('http') || endpoint.startsWith('/') ? endpoint : `${API_BASE}/${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Automatically send and receive httpOnly cookies
  };

  let response = await fetch(url, fetchOptions);

  // If 401 Unauthorized and not already refreshing, attempt token rotation
  if (response.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await authApi.refresh();
        if (refreshRes.success && refreshRes.data?.accessToken) {
          const newToken = refreshRes.data.accessToken;
          setInMemoryAccessToken(newToken);
          isRefreshing = false;
          onRefreshed(newToken);

          // Retry the original failed request with the new access token
          headers.set('Authorization', `Bearer ${newToken}`);
          return await fetch(url, { ...fetchOptions, headers });
        } else {
          setInMemoryAccessToken(null);
          isRefreshing = false;
          onRefreshed(null);
        }
      } catch (err) {
        setInMemoryAccessToken(null);
        isRefreshing = false;
        onRefreshed(null);
      }
    } else {
      // If a refresh is already in flight, wait for it to complete
      return new Promise<Response>((resolve) => {
        addRefreshSubscriber(async (newToken) => {
          if (newToken) {
            headers.set('Authorization', `Bearer ${newToken}`);
            resolve(await fetch(url, { ...fetchOptions, headers }));
          } else {
            resolve(response);
          }
        });
      });
    }
  }

  return response;
}

export const authApi = {
  // 1. Signup
  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await apiFetch(`${API_BASE}/signup`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error || (data.message && !res.ok ? data.message : undefined),
        data: data.data,
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message || 'Network error occurred. Please check your connection.',
      };
    }
  },

  // 2. Login
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await apiFetch(`${API_BASE}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.accessToken) {
        setInMemoryAccessToken(data.data.accessToken);
        // Normalize user properties
        if (data.data.user) {
          data.data.user.name = data.data.user.full_name;
        }
      }
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error || (data.message && !res.ok ? data.message : undefined),
        data: data.data,
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message || 'Network error occurred. Please check your connection.',
      };
    }
  },

  // 3. Verify Email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const res = await apiFetch(`${API_BASE}/verify-email`, {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error || (data.message && !res.ok ? data.message : undefined),
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message || 'Network error occurred.',
      };
    }
  },

  // 4. Resend Verification
  async resendVerification(email: string): Promise<AuthResponse> {
    try {
      const res = await apiFetch(`${API_BASE}/resend-verification`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error || (data.message && !res.ok ? data.message : undefined),
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message || 'Network error occurred.',
      };
    }
  },

  // 5. Refresh Session
  async refresh(): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.accessToken) {
        setInMemoryAccessToken(data.data.accessToken);
        if (data.data.user) {
          data.data.user.name = data.data.user.full_name;
        }
      } else {
        setInMemoryAccessToken(null);
      }
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error,
        data: data.data,
      };
    } catch (e: any) {
      setInMemoryAccessToken(null);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message,
      };
    }
  },

  // 6. Get Current User (/auth/me)
  async getMe(): Promise<AuthResponse> {
    try {
      const res = await apiFetch(`${API_BASE}/me`);
      const data = await res.json();
      if (res.ok && data.success && data.data?.user) {
        data.data.user.name = data.data.user.full_name;
      }
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error,
        data: data.data,
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message,
      };
    }
  },

  // 7. Forgot Password
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const res = await apiFetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error || (data.message && !res.ok ? data.message : undefined),
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message,
      };
    }
  },

  // 8. Reset Password
  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    try {
      const res = await apiFetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message,
        error: data.error || (data.message && !res.ok ? data.message : undefined),
      };
    } catch (e: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message,
      };
    }
  },

  // 9. Logout
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {}
    setInMemoryAccessToken(null);
  },

  // Helper getters
  getToken(): string | null {
    return inMemoryAccessToken;
  },
};
