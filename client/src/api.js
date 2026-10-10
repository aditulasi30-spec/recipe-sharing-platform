// Small fetch wrapper that adds the JWT and throws readable errors.
// Set VITE_API_URL only if the API is hosted on a different domain than the frontend.
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}
