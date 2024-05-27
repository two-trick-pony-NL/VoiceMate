import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
export const AuthContext = createContext();
export const AxiosInstanceContext = createContext(); // Export AxiosInstanceContext

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
  });

  useEffect(() => {
    const getStoredTokens = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (accessToken && refreshToken) {
          setAuthState({
            isAuthenticated: true,
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        }
      } catch (error) {
        console.error('Error retrieving tokens from secure storage:', error);
      }
    };
    getStoredTokens();
  }, []);

  const saveTokens = async (accessToken, refreshToken) => {
    try {
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      setAuthState({
        isAuthenticated: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      console.error('Error saving tokens to secure storage:', error);
    }
  };

  const axiosInstance = axios.create();

  axiosInstance.interceptors.request.use(
    async (config) => {
      const accessToken = authState.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        await refreshToken();
        return axiosInstance(originalRequest);
      }
      return Promise.reject(error);
    }
  );

  const login = async (email, password) => {
    try {
      const response = await fetch('https://triage.voicemate.nl/api/user/token/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Fetching tokens...');
      const data = await response.json();
      if (response.ok && data.access && data.refresh) {
        console.log('Login successful', data);
        await saveTokens(data.access, data.refresh);
      } else {
        console.log('Login failed', data);
      }
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = authState.refreshToken;
      const response = await fetch('https://triage.voicemate.nl/api/user/token/refresh/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      console.log('Refreshing access token...');
      const data = await response.json();
      if (response.ok && data.access) {
        console.log('Token refreshed successfully', data);
        setAuthState(prevState => ({
          ...prevState,
          accessToken: data.access
        }));
  
        // Decode the refresh token to check expiration time
        const decodedToken = jwtDecode(refreshToken);
        const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
        const expiresIn = decodedToken.exp - currentTime; // Calculate time until expiration
        console.log('Refresh token expires in', expiresIn, 'seconds');
  
        // Check if token has expired
        if (expiresIn <= 0) {
          console.log('Token has expired. Logging out...');
          await logout();
          return;
        }
      } else {
        console.log('Token refresh failed', data);
        // If token refresh fails, call logout function. 
        // The idea is that this forces the user to log in again and as such resets their
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing token', error);
      await logout();
    }
  };
  

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, refreshToken }}>
      <AxiosInstanceContext.Provider value={axiosInstance}>
        {children}
      </AxiosInstanceContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export const useAxiosInstance = () => useContext(AxiosInstanceContext);
