import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null, // Add refreshToken state
  });

  useEffect(() => {
    // Check for saved tokens in secure storage
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

  const login = async (email, password) => {
    // Simulate API call to authenticate user
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
      } else {
        console.log('Token refresh failed', data);
      }
    } catch (error) {
      console.error('Error refreshing token', error);
    }
  };

  const logout = async () => {
    // Remove tokens from secure storage
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
