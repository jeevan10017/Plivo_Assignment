import axios from 'axios';



const BASE_URL = process.env.REACT_APP_API_URL || 'https://plivo-assignment-5.onrender.com/api';


const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(async (config) => {
  const session = window.Clerk?.session;
  if (session) {
    try {
      const token = await session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting session token:', error);
    }
  }
  return config;
});
// Add a response interceptor for global error handling for auth
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        console.error('Authentication failed:', data?.message || 'You may need to log in again');
        
        const authErrorEvent = new CustomEvent('auth:error', { 
          detail: { status, message: data?.message } 
        });
        window.dispatchEvent(authErrorEvent);
      }
      
      if (status === 403) {
        console.error('Permission denied:', data?.message || 'You do not have permission to access this resource');
      }
      
      if (status === 404) {
        console.error('Resource not found:', data?.message);
      }
      
      if (status === 500) {
        console.error('Server error:', data?.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      console.error('Network error:', 'No response received from server');
    } else {
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

window.addEventListener('auth:error', () => {
  localStorage.removeItem('authToken');
});

export default apiClient;