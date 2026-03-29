import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Important for HttpOnly cookies
});

// Response interceptor to handle 401 Unauthorized (silent refresh)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired, and we should try to refresh it.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to hit the refresh endpoint (this will send the HttpOnly refreshToken cookie)
        await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // If successful, the new accessToken and refreshToken cookies are set by the backend.
        // We can now safely retry the original request.
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If the refresh fails (e.g., refresh token expired), we must logout the user locally.
        // The Redux store handles user logout, but here we can just reject or dispatch an event.
        // For simplicity, we just reject. The component level will catch this and redirect to login, 
        // or Redux can listen to this.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
