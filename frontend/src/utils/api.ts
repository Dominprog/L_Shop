const BASE_URL = 'http://localhost:3001/api';

async function request<T>(method: string, path: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error' }));
    throw new Error((err as { error: string }).error || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: object) => request<T>('POST', path, body),
  put: <T>(path: string, body: object) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
