/**
 * Dynamically resolves the API base URL.
 * When accessed from a local network device (e.g. mobile phone on 192.168.0.111:4200),
 * this automatically targets http://192.168.0.111:3000/api instead of failing on localhost!
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3000/api`;
  }
  return 'http://localhost:3000/api';
}

const TOKEN_KEY = 'naatukoottam_access_token';
const REFRESH_KEY = 'naatukoottam_refresh_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function saveStoredTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function removeStoredTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface LoginParams {
  identifier: string; // phone or email
  password: string;
}

export interface RegisterParams {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  district: string;
  locality: string;
  role?: 'CITIZEN' | 'DEPARTMENT_OFFICIAL';
  preferredLang?: string;
}

export async function loginApi(params: LoginParams) {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed. Please check your credentials.');
  }

  if (data.tokens?.accessToken) {
    saveStoredTokens(data.tokens.accessToken, data.tokens.refreshToken);
  }

  return data;
}

export async function registerApi(params: RegisterParams) {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed. Please check your inputs.');
  }

  if (data.tokens?.accessToken) {
    saveStoredTokens(data.tokens.accessToken, data.tokens.refreshToken);
  }

  return data;
}

export async function getCurrentUserApi() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 401) {
        removeStoredTokens();
      }
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn('Failed to verify token with /auth/me:', error);
    return null;
  }
}

export async function updateUserLocationApi(locationData: { locality: string; district: string; wardNumber?: number }) {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/auth/location`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to sync location to user account:', err);
    return null;
  }
}

export async function fetchLivePosts(locality?: string) {
  try {
    const apiBase = getApiBaseUrl();
    const url = new URL(`${apiBase}/posts`);
    if (locality) url.searchParams.set('locality', locality);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch posts');
    const json = await res.json();
    // Return clean data array directly without metadata wrap
    return Array.isArray(json) ? json : json.data || [];
  } catch (error) {
    console.warn('Backend API offline or unreachable, using client state:', error);
    return [];
  }
}

export async function createLivePostApi(postData: any) {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(postData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to submit post to backend');
  }

  return await res.json();
}

export async function fetchLiveIssues(locality?: string) {
  try {
    const apiBase = getApiBaseUrl();
    const url = new URL(`${apiBase}/issues`);
    if (locality) url.searchParams.set('locality', locality);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch issues');
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
  } catch (error) {
    console.warn('Backend API offline or unreachable:', error);
    return [];
  }
}

export async function fetchLiveConflicts(locality?: string) {
  try {
    const apiBase = getApiBaseUrl();
    const url = new URL(`${apiBase}/projects/conflicts`);
    if (locality) url.searchParams.set('locality', locality);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch conflicts');
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
  } catch (error) {
    console.warn('Backend API offline or unreachable:', error);
    return [];
  }
}

export async function uploadMediaApi(file: File): Promise<{ url: string; publicId?: string; bytes?: number }> {
  const apiBase = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', file);

  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${apiBase}/storage/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload media file');
  }

  return await res.json();
}

export async function createLiveIssueApi(issueData: any) {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/issues`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(issueData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to record grievance' }));
    throw new Error(error.message || 'Failed to record civic issue');
  }

  return await res.json();
}

export async function toggleLikeApi(postId: string) {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function toggleSupportApi(issueId: string) {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/issues/${issueId}/support`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deletePostOrIssueApi(id: string, isIssue?: boolean): Promise<boolean> {
  const apiBase = getApiBaseUrl();
  const headers = getAuthHeaders();

  // Try issue endpoint first if flagged as infrastructure issue
  if (isIssue) {
    try {
      const res = await fetch(`${apiBase}/issues/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) return true;
    } catch (err) {
      console.debug('Issue delete error:', err);
    }
  }

  // Try post endpoint
  try {
    const res = await fetch(`${apiBase}/posts/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) return true;
  } catch (err) {
    console.debug('Post delete error:', err);
  }

  // Fallback try issue endpoint
  if (!isIssue) {
    try {
      const res = await fetch(`${apiBase}/issues/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) return true;
    } catch (err) {
      console.debug('Fallback issue delete error:', err);
    }
  }

  return false;
}

export async function fetchLiveDepartments() {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/departments`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch departments');
    return await res.json();
  } catch (error) {
    console.warn('Backend API offline or unreachable:', error);
    return [];
  }
}
