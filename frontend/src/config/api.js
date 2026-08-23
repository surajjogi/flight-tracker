const configuredApiUrl = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const API_URL = configuredApiUrl.replace(/\/$/, '');