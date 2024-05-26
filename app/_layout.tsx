// RootLayout.js
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../authentication/authContext'; // Import the AuthProvider and useAuth
import LoginScreen from './loginscreen'; // Import the LoginScreen component

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const AppStack = () => (
  <Stack>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="+not-found" />
  </Stack>
);

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthContainer />
      </ThemeProvider>
    </AuthProvider>
  );
};

const AuthContainer = () => {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <LoginScreen />;
  }

  return <AppStack />;
};

export default RootLayout;
