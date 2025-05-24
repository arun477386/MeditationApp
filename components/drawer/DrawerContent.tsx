import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, InteractionManager } from 'react-native';
import { DrawerContentComponentProps, useDrawerStatus } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignUp } from '@/components/providers/SignUpProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useFocusEffect } from '@react-navigation/native';

interface UserProfile {
  name?: string;
}

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { presentSignUp } = useSignUp();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState(0);
  const isDrawerOpen = useDrawerStatus() === 'open';

  // Debounced profile fetch function (minimum 5 seconds between fetches)
  const loadUserProfile = useCallback(async (force = false) => {
    if (!user) {
      setProfile(null);
      return;
    }

    const now = Date.now();
    if (!force && now - lastFetchTimestamp < 5000) {
      return; // Skip if last fetch was less than 5 seconds ago
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      } else {
        setProfile({});
      }
      setLastFetchTimestamp(now);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile({});
    }
  }, [user, lastFetchTimestamp]);

  // Fetch profile when auth state changes
  useEffect(() => {
    if (user) {
      loadUserProfile(true);
    } else {
      setProfile(null);
    }
  }, [user]);

  // Fetch profile when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      loadUserProfile();
    }
  }, [isDrawerOpen]);

  // Fetch profile on screen focus
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [loadUserProfile])
  );

  const getDisplayName = () => {
    if (!user) return 'Guest';
    if (profile?.name) return profile.name;
    return user.email || 'Guest';
  };

  const getAvatarLetter = () => {
    if (!user) return 'G';
    if (profile?.name) return profile.name.charAt(0).toUpperCase();
    return user.email?.charAt(0).toUpperCase() || 'G';
  };

  const drawerItems = [
    ...(user ? [] : [{ label: 'Sign up', icon: 'user' as const, action: handleSignUp }]),
    { label: 'Check In', icon: 'check-circle' as const, route: 'checkin' },
    { label: 'Membership', icon: 'star' as const, route: 'membership' },
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
    navigation.closeDrawer();
    InteractionManager.runAfterInteractions(() => {
      if (item.route === 'settings') {
        router.push('/settings');
      } else if (item.route) {
        navigation.navigate(item.route);
      } else if (item.action) {
        item.action();
      }
    });
  }

  const handleProfilePress = () => {
    navigation.closeDrawer();
    InteractionManager.runAfterInteractions(() => {
      router.push('/profile');
    });
  };

  return (
    <ScrollView
      style={[styles.container, {
        paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : StatusBar.currentHeight || 0),
      }]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.profileContainer} onPress={handleProfilePress}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
        </View>
        <View style={styles.profileTextContainer}>
          <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
            {getDisplayName()}
          </Text>
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
  container: { 
    flex: 1, 
    backgroundColor: '#121212' 
  },
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
  avatarText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
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
  chevron: { 
    marginLeft: 'auto' 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#333', 
    marginBottom: 12 
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemIcon: { 
    width: 24 
  },
  itemText: {
    marginLeft: 16,
    fontSize: 17,
    color: '#fff',
    fontWeight: '400',
  },
});
