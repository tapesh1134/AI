import axios from 'axios';

const api = axios.create({
    baseURL: "/api", // API Gateway
    withCredentials: true,
});

// Global interceptor for 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // just return error
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default api;