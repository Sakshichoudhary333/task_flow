import axios from "axios";

export const AUTH_TOKEN_KEY = "taskflow:token";

const rawBaseUrl =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
