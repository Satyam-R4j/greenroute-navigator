export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const API_BASE = '/api/auth';

/**
 * Safely parses response body without throwing 'Unexpected end of JSON input'
 */
async function parseResponseJson(response: Response) {
  const text = await response.text();
  if (!text || text.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn("Non-JSON response from server:", text.substring(0, 150));
    return { message: `Server error (${response.status})` };
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await parseResponseJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Auth server is offline. Please make sure "npm run server" is running.');
    }
    throw err;
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await parseResponseJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Auth server is offline. Please make sure "npm run server" is running.');
    }
    throw err;
  }
}

export async function getCurrentUser(token: string): Promise<{ user: AuthUser }> {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await parseResponseJson(response);
    if (!response.ok) {
      throw new Error(data.message || 'Session expired');
    }

    return data;
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Auth server offline');
    }
    throw err;
  }
}
