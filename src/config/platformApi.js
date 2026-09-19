import axios from "axios";
import { API_BASE_URL } from "./api";

export const platformApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

platformApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("platform_jwt");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

platformApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem("platform_jwt");
      sessionStorage.removeItem("platform_admin_email");
      if (window.location.pathname !== "/platform/login") {
        window.location.href = "/platform/login";
      }
    }
    return Promise.reject(error);
  }
);
