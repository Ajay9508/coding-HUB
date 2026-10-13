import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api/v1" });
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("coding-hub-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
