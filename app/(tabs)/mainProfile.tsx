import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/components/providers/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { elementSizes } from '@/app/theme/sizes';

type RootDrawerParamList = {
  '(tabs)': undefined;
  '+not-found': undefined;
};

type MainProfileScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, '(tabs)'>;

interface UserProfile {
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  about?: string;
  location?: string;
  joinDate?: string;
  meditationStreak?: number;
  totalSessions?: number;
  totalMinutes?: number;
  preferences?: {
    notifications?: boolean;
    darkMode?: boolean;
    language?: string;
  };
}

export default function MainProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation<MainProfileScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = Colors[colorScheme ?? 'dark'];

  const handleDrawerOpen = () => {
    navigation.openDrawer();
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      Alert.alert('Success', 'You have been signed out successfully');
      router.back();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile({
            ...userData,
            email: user.email || undefined,
            joinDate: userData.joinDate || new Date().toISOString(),
          });
        } else {
          // Create initial profile if it doesn't exist
          const initialProfile: UserProfile = {
            email: user.email || undefined,
            joinDate: new Date().toISOString(),
            preferences: {
              notifications: true,
              darkMode: colorScheme === 'dark',
              language: 'en',
            },
          };
          setProfile(initialProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user, colorScheme]);

  const getInitials = () => {
    if (!user) return 'G';
    if (profile?.name) return profile.name.charAt(0).toUpperCase();
    return user.email?.charAt(0).toUpperCase() || 'G';
  };

  const renderStatItem = (icon: string, value: string | number, label: string) => (
    <View style={styles.statItem}>
      <Feather name={icon as any} size={24} color={theme.tint} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.icon }]}>{label}</ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={[styles.loadingText, { color: theme.text }]}>Loading profile...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.errorText, { color: theme.text }]}>{error}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          onPress={handleDrawerOpen}
          style={styles.iconButton}
        >
          <Feather name="menu" size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profile?.avatarUrl ? (
              <Image 
                source={{ uri: profile.avatarUrl }} 
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
                <ThemedText style={[styles.avatarText, { color: theme.background }]}>{getInitials()}</ThemedText>
              </View>
            )}
          </View>
          <View style={styles.nameContainer}>
            <ThemedText style={[styles.name, { color: theme.text }]}>{profile?.name || user?.email || 'Guest'}</ThemedText>
            <TouchableOpacity 
              style={[styles.editButton, { borderColor: theme.tint }]}
              onPress={() => router.push('/profile')}
            >
              <Feather name="edit-2" size={16} color={theme.tint} />
              <ThemedText style={[styles.editButtonText, { color: theme.tint }]}>Edit Profile</ThemedText>
            </TouchableOpacity>
          </View>
          {profile?.bio && (
            <ThemedText style={[styles.bio, { color: theme.text }]}>{profile.bio}</ThemedText>
          )}
          {profile?.location && (
            <View style={styles.locationContainer}>
              <Feather name="map-pin" size={16} color={theme.icon} />
              <ThemedText style={[styles.location, { color: theme.text }]}>{profile.location}</ThemedText>
            </View>
          )}
          {profile?.joinDate && (
            <ThemedText style={[styles.joinDate, { color: theme.text }]}>
              Member since {new Date(profile.joinDate).toLocaleDateString()}
            </ThemedText>
          )}
        </View>

        <View style={[styles.statsContainer, { borderColor: theme.border }]}>
          {renderStatItem('calendar', profile?.meditationStreak || 0, 'Day Streak')}
          {renderStatItem('clock', profile?.totalSessions || 0, 'Sessions')}
          {renderStatItem('clock', profile?.totalMinutes || 0, 'Minutes')}
        </View>

        {profile?.about && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>About</ThemedText>
            <ThemedText style={[styles.aboutText, { color: theme.text }]}>{profile.about}</ThemedText>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Account</ThemedText>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => router.push('/settings')}
          >
            <Feather name="settings" size={24} color={theme.icon} />
            <ThemedText style={[styles.menuItemText, { color: theme.text }]}>Settings</ThemedText>
            <Feather name="chevron-right" size={24} color={theme.icon} style={styles.chevron} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => router.push('/profile')}
          >
            <Feather name="star" size={24} color={theme.icon} />
            <ThemedText style={[styles.menuItemText, { color: theme.text }]}>Profile</ThemedText>
            <Feather name="chevron-right" size={24} color={theme.icon} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={handleSignOut}
          >
            <Feather name="log-out" size={24} color={theme.icon} />
            <ThemedText style={[styles.menuItemText, { color: theme.text }]}>Sign Out</ThemedText>
            <Feather name="chevron-right" size={24} color={theme.icon} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Activity</ThemedText>
          {/* <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => router.push('/library')}
          >
            <Feather name="book" size={24} color={theme.icon} />
            <ThemedText style={[styles.menuItemText, { color: theme.text }]}>Library</ThemedText>
            <Feather name="chevron-right" size={24} color={theme.icon} style={styles.chevron} />
          </TouchableOpacity> */}
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => router.push('/events')}
          >
            <Feather name="calendar" size={24} color={theme.icon} />
            <ThemedText style={[styles.menuItemText, { color: theme.text }]}>Events</ThemedText>
            <Feather name="chevron-right" size={24} color={theme.icon} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => router.push('/saved')}
          >
            <Feather name="bookmark" size={24} color={theme.icon} />
            <ThemedText style={[styles.menuItemText, { color: theme.text }]}>Saved</ThemedText>
            <Feather name="chevron-right" size={24} color={theme.icon} style={styles.chevron} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: elementSizes.topBarHeight,
  },
  iconButton: {
    width: elementSizes.iconButton,
    height: elementSizes.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 40,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
  },
  joinDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 'auto',
    paddingRight: 4,
  },
});
