import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, storage, auth } from '@/services/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function CreateTeacherScreen() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    languages: '',
    specialties: '',
    profilePic: null as string | null,
  });

  useEffect(() => {
    // Check authentication
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to create a teacher profile.');
      router.back();
      return;
    }

    // Check if user already has a teacher profile
    const checkExistingProfile = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (userDoc.exists() && userDoc.data().isTeacher) {
        Alert.alert('Error', 'You already have a teacher profile.');
        router.back();
        return;
      }
    };

    checkExistingProfile();
  }, []);

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Validate image size
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > 2 * 1024 * 1024) { // 2MB limit
          Alert.alert('Error', 'Image size should be less than 2MB');
          return;
        }

        setForm(prev => ({ ...prev, profilePic: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.bio || !form.location || !form.languages) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to create a teacher profile');
      }

      // Upload profile image if selected
      let profilePicUrl = '';
      if (form.profilePic) {
        try {
          const imageInfo = await FileSystem.getInfoAsync(form.profilePic);
          if (!imageInfo.exists) {
            throw new Error('Image file not found');
          }

          const imageStorageRef = ref(
            storage,
            `teachers/${currentUser.uid}/profile-${Date.now()}.jpg`
          );

          // Create a fetch request to get the file
          const response = await fetch(form.profilePic);
          const blob = await response.blob();
          
          await uploadBytes(imageStorageRef, blob);
          profilePicUrl = await getDownloadURL(imageStorageRef);
        } catch (error: any) {
          console.error('Image upload error:', error);
          Alert.alert('Error', error.message || 'Failed to upload image');
          setIsSaving(false);
          return;
        }
      }

      // Create teacher profile
      const teacherData = {
        userId: currentUser.uid,
        name: form.name.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        languages: form.languages.split(',').map(lang => lang.trim()),
        specialties: form.specialties.split(',').map(spec => spec.trim()),
        profilePicUrl: profilePicUrl || null,
        rating: 0,
        totalRatings: 0,
        totalStudents: 0,
        totalCourses: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add teacher profile to Firestore
      const teacherRef = doc(db, 'teachers', currentUser.uid);
      await updateDoc(teacherRef, teacherData);

      // Update user document to mark as teacher
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        isTeacher: true,
        teacherProfileId: currentUser.uid,
        updatedAt: serverTimestamp()
      });

      Alert.alert('Success', 'Teacher profile created successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error creating teacher profile:', error);
      Alert.alert('Error', error.message || 'Failed to create teacher profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Back">
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Teacher</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Name*</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={v => handleChange('name', v)} placeholder="Name" placeholderTextColor="#888" />

          <Text style={styles.label}>Bio*</Text>
          <TextInput style={[styles.input, styles.textArea]} value={form.bio} onChangeText={v => handleChange('bio', v)} placeholder="Bio" placeholderTextColor="#888" multiline />

          <Text style={styles.label}>Location*</Text>
          <TextInput style={styles.input} value={form.location} onChangeText={v => handleChange('location', v)} placeholder="Location" placeholderTextColor="#888" />

          <Text style={styles.label}>Languages* (comma separated)</Text>
          <TextInput style={styles.input} value={form.languages} onChangeText={v => handleChange('languages', v)} placeholder="e.g. English, Spanish" placeholderTextColor="#888" />

          <Text style={styles.label}>Specialties* (comma separated)</Text>
          <TextInput style={styles.input} value={form.specialties} onChangeText={v => handleChange('specialties', v)} placeholder="e.g. Math, Science" placeholderTextColor="#888" />

          <Text style={styles.label}>Profile Picture</Text>
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Profile Picture</Text>
          </TouchableOpacity>
          {form.profilePic && <Image source={{ uri: form.profilePic }} style={styles.profilePic} />}
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Creating...' : 'Create Teacher'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  formSection: {
    padding: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#00bfa5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  uploadButton: {
    backgroundColor: '#00bfa5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 10,
  },
}); 