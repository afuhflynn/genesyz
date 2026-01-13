import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Public axios instance (no auth required)
export const publicAxios = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Private axios instance (auth required - cookies are sent automatically)
export const privateAxios = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests
});

// Response interceptor for error handling
privateAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to sign-in on unauthorized
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
    }
    return Promise.reject(error);
  },
);
