const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

export async function api(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = API_BASE + endpoint;
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...Object.fromEntries(
      Object.entries(options.headers || {})
        .filter(([_, v]) => v !== null) as [string, string][]
    ),
  };

  const response = await fetch(url, { ...options, headers });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }
  return data;
}
