
// Purpose: Centralized Axios Instance supporting Local Vite Proxy & Production URL

import axios from "axios";

// In development: defaults to "/api" (proxied to http://localhost:5000 by vite.config.js)
// In production: uses VITE_API_URL (e.g., "https://bakehaven-api.onrender.com/api")
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return "/api";
  return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Sends and receives httpOnly cookies across domains
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
