import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/services/firebase';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import base64js from 'base64-js';

const convertBase64ToBlob = (base64: string, contentType = '') => {
  const byteArray = base64js.toByteArray(base64);
  return new Blob([byteArray], { type: contentType });
};

export default function UploadTrackScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    type: 'Guided',
    duration: '',
    image: '',
    audio: '',
  });
  const [imageName, setImageName] = useState('');
  const [audioName, setAudioName] = useState('');

  useEffect(() => {
    // Check authentication
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to upload tracks.');
      router.back();
      return;
    }

    // Request permissions
    (async () => {
      const { status: imageStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (imageStatus !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your media library.');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Validate image size
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > 2 * 1024 * 1024) { // 2MB limit
          Alert.alert('Error', 'Image size should be less than 2MB');
          return;
        }

        setForm(prev => ({ ...prev, image: result.assets[0].uri }));
        setImageName(result.assets[0].uri.split('/').pop() || 'Image uploaded');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets.length > 0) {
        // Validate audio size
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > 10 * 1024 * 1024) { // 10MB limit
          Alert.alert('Error', 'Audio file size should be less than 10MB');
          return;
        }

        setForm(prev => ({ ...prev, audio: result.assets[0].uri }));
        setAudioName(result.assets[0].name || 'Audio uploaded');
      }
    } catch (error) {
      console.error('Audio picker error:', error);
      Alert.alert('Error', 'Failed to pick audio. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.author || !form.duration || !form.image || !form.audio) {
      Alert.alert('Error', 'Please fill in all fields and upload both image and audio');
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to upload tracks');
      }

      // Upload image
      let imageUrl;
      try {
        const imageInfo = await FileSystem.getInfoAsync(form.image);
        if (!imageInfo.exists) {
          throw new Error('Image file not found');
        }

        const imageStorageRef = ref(
          storage,
          `tracks/images/${Date.now()}-${imageName || 'image.jpg'}`
        );

        // Create a fetch request to get the file
        const response = await fetch(form.image);
        const blob = await response.blob();
        
        await uploadBytes(imageStorageRef, blob);
        imageUrl = await getDownloadURL(imageStorageRef);
      } catch (error: any) {
        console.error('Image upload error:', error);
        throw new Error('Failed to upload image. Please try again.');
      }

      // Upload audio
      let audioUrl;
      try {
        const audioInfo = await FileSystem.getInfoAsync(form.audio);
        if (!audioInfo.exists) {
          throw new Error('Audio file not found');
        }

        const audioStorageRef = ref(
          storage,
          `tracks/audio/${Date.now()}-${audioName || 'audio.mp3'}`
        );

        // Create a fetch request to get the file
        const response = await fetch(form.audio);
        const blob = await response.blob();
        
        await uploadBytes(audioStorageRef, blob);
        audioUrl = await getDownloadURL(audioStorageRef);
      } catch (error: any) {
        console.error('Audio upload error:', error);
        throw new Error('Failed to upload audio. Please try again.');
      }

      // Create track document
      const tracksRef = collection(db, 'tracks');
      const trackData = {
        title: form.title.trim(),
        author: form.author.trim(),
        type: form.type,
        duration: form.duration.trim(),
        imageUrl,
        audioUrl,
        rating: 4.5,
        totalRatings: 0,
        totalPlays: 0,
        uploadedBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublished: true,
        tags: [],
        category: 'meditation'
      };

      await addDoc(tracksRef, trackData);
      Alert.alert('Success', 'Track uploaded successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error uploading track:', error);
      Alert.alert('Error', error.message || 'Failed to upload track');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Track</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
            placeholder="Enter track title"
            placeholderTextColor="#666666"
          />
          <Text style={styles.label}>Author</Text>
          <TextInput
            style={styles.input}
            value={form.author}
            onChangeText={(text) => setForm(prev => ({ ...prev, author: text }))}
            placeholder="Enter author name"
            placeholderTextColor="#666666"
          />
          <Text style={styles.label}>Duration</Text>
          <TextInput
            style={styles.input}
            value={form.duration}
            onChangeText={(text) => setForm(prev => ({ ...prev, duration: text }))}
            placeholder="Enter track duration (e.g., 15 min)"
            placeholderTextColor="#666666"
          />
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickImage}
            disabled={isLoading}
          >
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
          {imageName ? <Text style={styles.uploadedText}>{imageName}</Text> : null}
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickAudio}
            disabled={isLoading}
          >
            <Text style={styles.uploadButtonText}>Upload Audio</Text>
          </TouchableOpacity>
          {audioName ? <Text style={styles.uploadedText}>{audioName}</Text> : null}
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Uploading...' : 'Upload Track'}
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#00bfa5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  uploadedText: {
    color: '#00bfa5',
    fontSize: 14,
    marginBottom: 16,
  },
}); 