import axios from 'axios';

const api = axios.create({
  // Using relative path so Vite proxy catches it locally, and Vercel proxy catches it in production
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the payload exactly as the backend engineer requested
    if (config.method?.toUpperCase() === 'PUT') {
      console.log('PUT Payload', config.data);
    } else if (config.method?.toUpperCase() === 'POST' && config.url?.includes('/bulk')) {
      console.log('Bulk Payload', config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 400) {
      // Deep logging for 400 Bad Request to trace exact cause
      console.error("❌ 400 Bad Request Error Intercepted!");
      console.error("Target URL:", error.config?.url);
      console.error("Payload Sent:", JSON.stringify(error.config?.data ? JSON.parse(error.config.data) : {}, null, 2));
      console.error("Backend Response:", JSON.stringify(error.response?.data, null, 2));

      // Attempt to extract specific validation messages
      const resData = error.response?.data;
      if (resData) {
        // If the backend returns a specific field error e.g. { field: "difficulty", message: "Difficulty is required" }
        if (resData.field && resData.message) {
           error.message = `${resData.field}: ${resData.message}`;
        }
        // If it's a generic message property (but not just 'Validation failed' if we have detailed errors)
        else if (resData.message && (!resData.errors || resData.errors.length === 0)) {
           error.message = resData.message;
        } 
        // If it's an array of errors (Zod / Express Validator)
        if (Array.isArray(resData.errors) && resData.errors.length > 0) {
           const firstError = resData.errors[0];
           const field = firstError.path || firstError.param || 'unknown_field';
           const msg = firstError.msg || firstError.message || JSON.stringify(firstError);
           
           error.message = `Validation Error on '${field}': ${msg}`;
           
           // Overwrite response data entirely with exact object requested by user
           error.response.data = {
             success: false,
             field: field,
             message: error.message
           };
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
