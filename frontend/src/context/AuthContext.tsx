import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '../types';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

// Get the backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Make sure BACKEND_URL doesn't have a trailing slash
const normalizedBackendUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;

// Configure axios defaults
axios.defaults.baseURL = BACKEND_URL;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean; // Add loading state
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state

  // Check for stored token and user data on initial load
  useEffect(() => {
    // Helper function to clear all auth data
    const clearAuthData = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      setUser(null);
      setIsAdmin(false);
      delete axios.defaults.headers.common['Authorization'];
      console.log('Auth data cleared');
    };
    
    // Authentication check on app start
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const adminStatus = localStorage.getItem('isAdmin');
        
        if (storedUser && token) {
          try {
            // Try to extract the user ID from the token first
            let userId;
            try {
              // Check if token is valid by decoding it
              const decoded: any = jwtDecode(token);
              
              // Verify token hasn't expired
              const currentTime = Date.now() / 1000;
              if (decoded.exp && decoded.exp < currentTime) {
                console.warn('Token has expired');
                clearAuthData();
                return;
              }
              
              userId = decoded.id; // The backend puts the user ID in the 'id' field of the token
              console.log('Decoded token:', decoded);
            } catch (decodeErr) {
              console.error('Failed to decode token:', decodeErr);
              // If we can't decode the token, clear all auth data and return
              clearAuthData();
              return;
            }
            
            // Now create the user object with the correct ID
            const userData = JSON.parse(storedUser);
            // Override the ID with the one from the token if available
            userData.id = userId || userData.id;
            
            setUser(userData);
            setIsAdmin(adminStatus === 'true');
            // Set axios default header for all requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Optional: Verify token with backend
            try {
              // Make a lightweight request to verify the token
              await axios.get(`${normalizedBackendUrl}/api/users/me`);
            } catch (verifyErr: any) {
              // If server rejects the token, clear auth data
              if (verifyErr.response?.status === 401) {
                console.warn('Token rejected by server');
                clearAuthData();
                return;
              }
            }
          } catch (err) {
            console.error('Failed to parse stored user data or invalid token', err);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      
      const response = await axios.post(`${normalizedBackendUrl}/api/users/login`, { email, password });
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token
      const token = data.token;
      localStorage.setItem('token', token);
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // First, try to find the user by email to get their MongoDB ID
      try {
        // This is a temporary solution - in a real app, you'd want the backend to return the user ID
        const userResponse = await axios.post(`${normalizedBackendUrl}/api/users/find-by-email`, { email });
        if (userResponse.data.success && userResponse.data.user) {
          console.log('Found user by email:', userResponse.data.user);
          // Use the MongoDB ID from the backend response
          const mongoUserId = userResponse.data.user._id;
          
          // Create user object with the MongoDB ID
          const userData: User = {
            id: mongoUserId,
            name: userResponse.data.user.name || email.split('@')[0],
            email: email,
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800'
          };
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          toast.success('Login successful!');
          return;
        }
      } catch (findError) {
        console.error('Error finding user by email:', findError);
        // Continue with the fallback approach
      }
      
      // Extract user ID from token
      let userId;
      try {
        // Decode the JWT token to get the user ID
        const decoded: any = jwtDecode(token);
        userId = decoded.id; // The backend puts the user ID in the 'id' field of the token
        console.log('Decoded token:', decoded);
        
        // Check if the ID is a valid MongoDB ObjectId (24 hex characters)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
        if (!isValidObjectId) {
          console.warn('Token contains invalid ObjectId:', userId);
          // Use a temporary ID that won't cause MongoDB to try to convert it
          userId = 'invalid-id';
        }
      } catch (err) {
        console.error('Failed to decode token:', err);
        // Use a string ID that won't cause MongoDB to try to convert it
        userId = 'invalid-id';
      }
      
      // Create user object
      const userData: User = {
        id: userId, // Use the ID from the JWT token
        name: email.split('@')[0], // Using email as temporary name
        email: email,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800'
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Login successful!');
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', err);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('AdminLogin - Attempting admin login with:', { email });
      
      const response = await axios.post(`${normalizedBackendUrl}/api/users/admin`, { email, password });
      const data = response.data;
      console.log('AdminLogin - Server response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Admin login failed');
      }
      
      // Store token
      const token = data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('isAdmin', 'true');
      console.log('AdminLogin - Token and isAdmin stored in localStorage');
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create admin user object - Admin doesn't need cart functionality
      const userData: User = {
        id: 'admin', // Admin ID is 'admin'
        name: 'Admin',
        email: email,
        avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=800'
      };
      
      // Explicitly set admin status first
      setIsAdmin(true);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('AdminLogin - Admin status set:', { isAdmin: true, user: userData });
      toast.success('Admin login successful!');
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Admin login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Admin login error:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin, 
      isLoading,
      login, 
      adminLogin,
      logout, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};