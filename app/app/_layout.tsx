import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { C } from "../constants/Colors";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: C.primary,
    background: C.bg,
    surface: C.surface,
    surfaceVariant: C.surface2,
    onSurface: C.text,
    onBackground: C.text,
    onSurfaceVariant: C.text2,
    outline: C.border,
    secondaryContainer: C.surface2,
  },
};

export default function RootLayout() {
  const [checked, setChecked] = useState(false);
  const [needsCalibration, setNeedsCalibration] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync("calibrated").then((val) => {
      setNeedsCalibration(!val);
      setChecked(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!checked) return null;

  return (
    <PaperProvider theme={paperTheme}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          {needsCalibration && (
            <Stack.Screen name="calibration" options={{ gestureEnabled: false }} />
          )}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </QueryClientProvider>
    </PaperProvider>
  );
}
