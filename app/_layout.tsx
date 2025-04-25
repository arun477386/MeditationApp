import { Stack } from 'expo-router';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SignUpProvider } from '@/components/providers/SignUpProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PTSerif: require('../assets/fonts/PTSerif-Regular.ttf'),
    PTSerifBold: require('../assets/fonts/PTSerif-Bold.ttf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const colorScheme = useColorScheme();

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    async function setNavigationBarColor() {
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync('#121212');
        await NavigationBar.setButtonStyleAsync('light');
      }
    }
    setNavigationBarColor();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthProvider>
              <SignUpProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    headerStyle: {
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                    },
                    headerTintColor: Colors[colorScheme ?? 'light'].text,
                  }}
                >
                  <Stack.Screen 
                    name="(drawer)" 
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen 
                    name="+not-found" 
                    options={{ headerShown: false }}
                  />
                </Stack>
              </SignUpProvider>
            </AuthProvider>
          </ThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
