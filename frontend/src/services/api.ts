import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the request headers
    if (token) {
      // The backend expects the token in a header named 'token'
      config.headers.token = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
