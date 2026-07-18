import axios from 'axios';
import { store } from '../store';
import { showLoader, hideLoader } from '../store/loaderSlice';

declare module 'axios' {
  export interface AxiosRequestConfig {
    hideLoader?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    hideLoader?: boolean;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5242',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: inject Bearer Token and trigger global loader
apiClient.interceptors.request.use(
  (config) => {
    // By default, hideLoader is undefined (which is falsy), so the loader shows.
    // If hideLoader is explicitly set to true, it won't show.
    if (!config.hideLoader) {
      store.dispatch(showLoader());
    }

    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (!error.config?.hideLoader) {
      store.dispatch(hideLoader());
    }
    return Promise.reject(error);
  }
);

// Response Interceptor: handle global loader cleanup & 401 token refresh
apiClient.interceptors.response.use(
  (response) => {
    if (response.config && !response.config.hideLoader) {
      store.dispatch(hideLoader());
    }
    return response;
  },
  async (error) => {
    if (!error.config?.hideLoader) {
      store.dispatch(hideLoader());
    }

    const originalRequest = error.config;
    if (error.response?.status === 500) {
      window.location.href = '/internal-server-error';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt token refresh, making sure we don't trigger the loader again (hideLoader: true)
        const response = await axios.post(`${apiClient.defaults.baseURL}/api/auth/refresh`, {}, {
          withCredentials: true, // Send refresh token cookie
          hideLoader: true,
        });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

