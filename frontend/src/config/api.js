const productionApiUrl = 'https://flight-tracker-n700.onrender.com';

export const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : productionApiUrl);