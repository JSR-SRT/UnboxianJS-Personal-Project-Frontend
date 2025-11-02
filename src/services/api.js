import axios from "axios";

// ใช้ VITE_API_URL ทั้ง dev และ prod
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3030";

const api = axios.create({
  baseURL,
  withCredentials: true, // critical for sending cookies!
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor สำหรับจัดการ errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized:", error.config.url);
    }
    return Promise.reject(error);
  }
);

export default api;
