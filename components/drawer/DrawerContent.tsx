import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, InteractionManager } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignUp } from '@/components/providers/SignUpProvider';

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { presentSignUp } = useSignUp();

  const drawerItems = [
    { label: 'Sign up', icon: 'user' as const, action: handleSignUp },
    { label: 'Membership', icon: 'star' as const, route: 'membership' },
    { label: 'Check-in', icon: 'check-circle' as const, route: 'check-in' },
    { label: 'Journal', icon: 'monitor' as const, route: 'journal' },
    { label: 'Notifications', icon: 'bell' as const, route: 'notifications' },
    { label: 'Friends', icon: 'users' as const, route: 'friends' },
    { label: 'Groups', icon: 'users' as const, route: 'groups' },
    { label: 'Invite a friend', icon: 'user-plus' as const, route: 'invite' },
    { label: 'Help', icon: 'help-circle' as const, route: 'help' },
    { label: 'Settings', icon: 'settings' as const, route: 'settings' },
  ];

  function handleSignUp() {
    navigation.closeDrawer();
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        presentSignUp();
      }, 300);
    });
  }

  function handleItemPress(item: any) {
    if (item.route) {
      navigation.navigate(item.route);
    } else if (item.action) {
      item.action();
    }
  }

  return (
    <ScrollView
      style={[styles.container, {
        paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : StatusBar.currentHeight || 0),
      }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.profileContainer}>
        <View style={styles.avatarCircle}>
          <Feather name="user" size={24} color="#fff" />
        </View>
        <View style={styles.profileTextContainer}>
          <Text style={styles.nameText}>Guest</Text>
          <Text style={styles.viewProfile}>View Profile</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#666" style={styles.chevron} />
      </TouchableOpacity>

      <View style={styles.divider} />

      {drawerItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.itemRow}
          onPress={() => handleItemPress(item)}
        >
          <Feather name={item.icon} size={22} color="#fff" style={styles.itemIcon} />
          <Text style={styles.itemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  nameText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  viewProfile: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '500',
  },
  chevron: { marginLeft: 'auto' },
  divider: { height: 1, backgroundColor: '#333', marginBottom: 12 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemIcon: { width: 24 },
  itemText: {
    marginLeft: 16,
    fontSize: 17,
    color: '#fff',
    fontWeight: '400',
  },
});
