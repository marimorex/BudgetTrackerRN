import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { useEffect, useState } from "react";
import { initDb } from "../src/db/database";
import { seedIfEmpty } from "../src/db/seeds";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDb();
    seedIfEmpty();
    setDbReady(true);
  }, []);

  if (!dbReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="accounts/form" options={{ presentation: 'modal', title: 'Account Form' }} />
        <Stack.Screen name="banks/form" options={{ presentation: 'modal', title: 'Bank Form' }} />
        <Stack.Screen name="categories/form" options={{ presentation: 'modal', title: 'Category Form' }} />
        <Stack.Screen name="index/form" options={{ presentation: 'modal', title: 'Transaction Form' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
