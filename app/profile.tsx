import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/components/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { auth } from '@/services/firebase';

interface UserProfile {
  name: string;
  bio: string;
  language: string;
  timezone: string;
  preferences: {
    notifications: {
      dailyReminder: boolean;
      friendRequests: boolean;
      courseUpdates: boolean;
    };
  };
}

const defaultProfile: UserProfile = {
  name: '',
  bio: '',
  language: 'English',
  timezone: 'UTC+00:00',
  preferences: {
    notifications: {
      dailyReminder: true,
      friendRequests: true,
      courseUpdates: true,
    },
  },
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user!.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          language: data.language || defaultProfile.language,
          timezone: data.timezone || defaultProfile.timezone,
          preferences: {
            notifications: {
              dailyReminder: data.preferences?.notifications?.dailyReminder ?? defaultProfile.preferences.notifications.dailyReminder,
              friendRequests: data.preferences?.notifications?.friendRequests ?? defaultProfile.preferences.notifications.friendRequests,
              courseUpdates: data.preferences?.notifications?.courseUpdates ?? defaultProfile.preferences.notifications.courseUpdates,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to save changes');
      return;
    }

    if (!profile.name.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitial = (email: string) => {
    return email?.charAt(0).toUpperCase() || 'G';
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

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {getInitial(user?.email || '')}
            </Text>
          </View>

          <Text style={[styles.email, { color: colors.text }]}>
            {user?.email || 'Guest'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                color: colors.text,
                borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
              }]}
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
              placeholder="Enter your display name"
              placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, { 
                backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                color: colors.text,
                borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
              }]}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              placeholder="Tell us about yourself"
              placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Timezone</Text>
            <TouchableOpacity 
              style={[styles.input, styles.selectInput, { 
                backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
              }]}
            >
              <Text style={{ color: colors.text }}>{profile.timezone}</Text>
              <Feather name="chevron-right" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Language</Text>
            <TouchableOpacity 
              style={[styles.input, styles.selectInput, { 
                backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
              }]}
            >
              <Text style={{ color: colors.text }}>{profile.language}</Text>
              <Feather name="chevron-right" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Notification Preferences</Text>
            <TouchableOpacity 
              style={[styles.input, styles.selectInput, { 
                backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
              }]}
            >
              <Text style={{ color: colors.text }}>Manage Notifications</Text>
              <Feather name="chevron-right" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { backgroundColor: '#1DB954', opacity: isSaving ? 0.7 : 1 }
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '600',
  },
  email: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 56,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  bioInput: {
    height: 120,
    paddingTop: 16,
    paddingBottom: 16,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  saveButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 