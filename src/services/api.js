import axios from "axios";

// ใช้ VITE_API_URL ทั้ง dev และ prod
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3030";

const api = axios.create({
  baseURL,
  withCredentials: true, // critical for sending cookies!
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Interceptor สำหรับจัดการ errors
api.interceptors.response.use(
  (response) => {
    // Log สำหรับ debug (เอาออกใน production)
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized:", error.config.url);
    }

    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

export default api;
