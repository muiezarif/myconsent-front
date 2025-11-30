import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:8800/api",
  baseURL: "https://backend.myconsent.me/api",
  withCredentials: false, // we use Bearer tokens, no cookies needed
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;