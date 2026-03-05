const BASE_URL = 'http://localhost:3001/api';

/**
 * Базовая функция для HTTP-запросов к API.
 * @template T - тип ожидаемого ответа
 * @param {string} method - HTTP-метод: GET, POST, PUT, DELETE
 * @param {string} path - путь запроса, например '/products'
 * @param {object} [body] - тело запроса для POST/PUT
 * @returns {Promise<T>} распарсенный ответ сервера
 * @throws {Error} если сервер вернул ошибку
 */
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

/**
 * Объект с методами для работы с API сервера.
 * @example
 * const products = await api.get<Product[]>('/products');
 * const user = await api.post<User>('/users/login', { email, password });
 */
export const api = {
  /** GET-запрос */
  get: <T>(path: string) => request<T>('GET', path),
  /** POST-запрос с телом */
  post: <T>(path: string, body: object) => request<T>('POST', path, body),
  /** PUT-запрос с телом */
  put: <T>(path: string, body: object) => request<T>('PUT', path, body),
  /** DELETE-запрос */
  delete: <T>(path: string) => request<T>('DELETE', path),
};