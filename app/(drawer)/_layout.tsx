import { Drawer } from 'expo-router/drawer';
import { Platform } from 'react-native';
import { DrawerContent } from '@/components/drawer/DrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
          backgroundColor: '#121212',
        },
        drawerType: Platform.select({ ios: 'slide', android: 'front' }),
        overlayColor: Platform.select({ ios: 'transparent', android: 'rgba(0,0,0,0.5)' }),
        swipeEnabled: true,
        swipeEdgeWidth: 100,
        drawerContentStyle: {
          backgroundColor: '#121212',
        },
      }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
    </Drawer>
  );
} 