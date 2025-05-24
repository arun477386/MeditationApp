import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from '@/components/drawer/DrawerContent';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Enable native screens for better performance
enableScreens();

const Drawer = createDrawerNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
          backgroundColor: theme.background,
        },
        drawerType: Platform.select({ ios: 'slide', android: 'front' }),
        overlayColor: Platform.select({ ios: 'transparent', android: 'rgba(0,0,0,0.5)' }),
        swipeEnabled: true,
        swipeEdgeWidth: 100,
      }}
    >
      <Drawer.Screen name="tabs">
        {() => (
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: theme.tabIconSelected,
              tabBarInactiveTintColor: theme.tabIconDefault,
              headerShown: false,
              tabBarStyle: {
                backgroundColor: theme.background,
                borderTopWidth: 0,
                paddingVertical: 10,
              },
            }}>
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Feather name="home" size={24} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="timer"
              options={{
                title: 'Timer',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Feather name="clock" size={24} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="teachers"
              options={{
                title: 'Teachers',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Feather name="book-open" size={24} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="checkin"
              options={{
                title: 'Check In',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Feather name="check-circle" size={24} color={color} />
                ),
              }}
            />
            {/* <Tabs.Screen
              name="saved"
              options={{
                title: 'Saved',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Feather name="bookmark" size={24} color={color} />
                ),
              }}
            /> */}
            <Tabs.Screen
              name="mainProfile"
              options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Feather name="user" size={24} color={color} />
                ),
              }}
            />
          </Tabs>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
