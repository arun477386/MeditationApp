import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/components/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/services/firebase';
import { auth } from '@/services/firebase';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UserProfile {
  name: string;
  bio: string;
  language: string;
  timezone: string;
  avatarUrl?: string;
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
  const theme = Colors[colorScheme ?? 'dark'];
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
          avatarUrl: data.avatarUrl || undefined,
          preferences: {
            notifications: {
              dailyReminder: data.preferences?.notifications?.dailyReminder ?? defaultProfile.preferences.notifications.dailyReminder,
              friendRequests: data.preferences?.notifications?.friendRequests ?? defaultProfile.preferences.notifications.friendRequests,
              courseUpdates: data.preferences?.notifications?.courseUpdates ?? defaultProfile.preferences.notifications.courseUpdates,
            },
          },
        });
      } else {
        // Initialize profile with default values if it doesn't exist
        setProfile({
          ...defaultProfile,
          avatarUrl: undefined,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile_images/${user.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      setProfile(prev => ({ ...prev, avatarUrl: downloadURL }));
      
      // Update Firestore with new avatar URL
      await setDoc(doc(db, 'users', user.uid), {
        avatarUrl: downloadURL,
        updatedAt: serverTimestamp(),
      }, { merge: true });

    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUploading(false);
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
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profile.avatarUrl ? (
              <Image 
                source={{ uri: profile.avatarUrl }} 
                style={styles.avatarCircle}
                resizeMode="cover"
                onError={() => {
                  setProfile(prev => ({ ...prev, avatarUrl: undefined }));
                }}
              />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: theme.tint }]}>
                <Text style={[styles.avatarText, { color: theme.background }]}>
                  {getInitial(user?.email || '')}
                </Text>
              </View>
            )}
            <View style={[styles.editAvatarButton, { backgroundColor: theme.tint }]}>
              <Feather name="camera" size={16} color={theme.background} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.email, { color: theme.text }]}>
            {user?.email || 'Guest'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { 
                color: theme.text,
                backgroundColor: theme.card,
                borderColor: theme.border
              }]}
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
              placeholderTextColor={theme.icon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                color: theme.text,
                backgroundColor: theme.card,
                borderColor: theme.border
              }]}
              value={profile.bio}
              onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.icon}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Language</Text>
            <TextInput
              style={[styles.input, { 
                color: theme.text,
                backgroundColor: theme.card,
                borderColor: theme.border
              }]}
              value={profile.language}
              onChangeText={(text) => setProfile(prev => ({ ...prev, language: text }))}
              placeholder="Select your preferred language"
              placeholderTextColor={theme.icon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Timezone</Text>
            <TextInput
              style={[styles.input, { 
                color: theme.text,
                backgroundColor: theme.card,
                borderColor: theme.border
              }]}
              value={profile.timezone}
              onChangeText={(text) => setProfile(prev => ({ ...prev, timezone: text }))}
              placeholder="Select your timezone"
              placeholderTextColor={theme.icon}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
            <View style={[styles.preferenceItem, { borderBottomColor: theme.border }]}>
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>Daily Reminder</Text>
              <TouchableOpacity
                style={[styles.toggle, { backgroundColor: profile.preferences.notifications.dailyReminder ? theme.tint : theme.card }]}
                onPress={() => setProfile(prev => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    notifications: {
                      ...prev.preferences.notifications,
                      dailyReminder: !prev.preferences.notifications.dailyReminder
                    }
                  }
                }))}
              >
                <View style={[styles.toggleKnob, { 
                  transform: [{ translateX: profile.preferences.notifications.dailyReminder ? 20 : 0 }],
                  backgroundColor: theme.background
                }]} />
              </TouchableOpacity>
            </View>

            <View style={[styles.preferenceItem, { borderBottomColor: theme.border }]}>
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>Friend Requests</Text>
              <TouchableOpacity
                style={[styles.toggle, { backgroundColor: profile.preferences.notifications.friendRequests ? theme.tint : theme.card }]}
                onPress={() => setProfile(prev => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    notifications: {
                      ...prev.preferences.notifications,
                      friendRequests: !prev.preferences.notifications.friendRequests
                    }
                  }
                }))}
              >
                <View style={[styles.toggleKnob, { 
                  transform: [{ translateX: profile.preferences.notifications.friendRequests ? 20 : 0 }],
                  backgroundColor: theme.background
                }]} />
              </TouchableOpacity>
            </View>

            <View style={[styles.preferenceItem, { borderBottomColor: theme.border }]}>
              <Text style={[styles.preferenceLabel, { color: theme.text }]}>Course Updates</Text>
              <TouchableOpacity
                style={[styles.toggle, { backgroundColor: profile.preferences.notifications.courseUpdates ? theme.tint : theme.card }]}
                onPress={() => setProfile(prev => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    notifications: {
                      ...prev.preferences.notifications,
                      courseUpdates: !prev.preferences.notifications.courseUpdates
                    }
                  }
                }))}
              >
                <View style={[styles.toggleKnob, { 
                  transform: [{ translateX: profile.preferences.notifications.courseUpdates ? 20 : 0 }],
                  backgroundColor: theme.background
                }]} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.tint }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text style={[styles.saveButtonText, { color: theme.background }]}>Save Changes</Text>
            )}
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
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
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
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  preferenceLabel: {
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 