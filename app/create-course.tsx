import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth} from '@/services/firebase';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function CreateCourseScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: '',
    image: '',
    audio: '',
    price: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    tags: '',
    coverImage: '',
  });
  const [imageName, setImageName] = useState('');
  const [audioName, setAudioName] = useState('');

  useEffect(() => {


    // Check authentication
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to create a course.');
      router.back();
      return;
    }

    // Check if user is a teacher
    const checkTeacherStatus = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (!userDoc.exists() || !userDoc.data().isTeacher) {
        Alert.alert('Error', 'Only teachers can create courses.');
        router.back();
        return;
      }
    };

    checkTeacherStatus();
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

  const uploadFile = async (uri: string, path: string) => {
    try {
      // Validate URI
      if (!uri) {
        throw new Error('Invalid file URI');
      }

      // Fetch and convert to blob
      const response = await fetch(uri);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      
      // Check file size (10MB limit for audio, 2MB for images)
      const maxSize = path.includes('/audio/') ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
      if (blob.size > maxSize) {
        throw new Error(`File size should be less than ${maxSize / (1024 * 1024)}MB`);
      }

      // Create storage reference with unique name
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(7);
      const storageRef = ref(storage, `${path}_${timestamp}_${uniqueId}`);

      // Define metadata based on file type
      const isAudio = path.includes('/audio/');
      const metadata = {
        contentType: isAudio ? 'audio/mpeg' : 'image/jpeg',
        customMetadata: {
          uploadedAt: timestamp.toString(),
          originalSize: blob.size.toString(),
          fileType: isAudio ? 'audio' : 'image',
          uploadedBy: auth.currentUser?.uid || 'unknown'
        }
      };

      // Upload with retry logic
      let uploadResult;
      try {
        uploadResult = await uploadBytes(storageRef, blob, metadata);
      } catch (error: any) {
        console.error('Initial upload failed:', error);
        if (error.code === 'storage/unknown') {
          const retryRef = ref(storage, `${path}_retry_${timestamp}_${uniqueId}`);
          uploadResult = await uploadBytes(retryRef, blob, metadata);
        } else {
          throw error;
        }
      }

      const downloadURL = await getDownloadURL(uploadResult.ref);
      return downloadURL;
    } catch (error: any) {
      console.error('File upload error:', error);
      throw new Error(error.message || 'Failed to upload file. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.duration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create a course');
        return;
      }

      // Check if user is a teacher
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        Alert.alert('Error', 'User profile not found');
        return;
      }

      const userData = userDoc.data();
      if (!userData.isTeacher) {
        Alert.alert('Error', 'Only teachers can create courses');
        return;
      }

      // Upload image if selected
      let imageUrl = '';
      if (form.image) {
        try {
          const imageInfo = await FileSystem.getInfoAsync(form.image);
          if (!imageInfo.exists) {
            throw new Error('Image file not found');
          }

          const imageStorageRef = ref(
            storage,
            `courses/${currentUser.uid}/images/${Date.now()}-${imageName || 'image.jpg'}`
          );

          // Create a fetch request to get the file
          const response = await fetch(form.image);
          const blob = await response.blob();
          
          await uploadBytes(imageStorageRef, blob);
          imageUrl = await getDownloadURL(imageStorageRef);
        } catch (error: any) {
          console.error('Image upload error:', error);
          Alert.alert('Error', error.message || 'Failed to upload image');
          setIsLoading(false);
          return;
        }
      }

      // Upload audio if selected
      let audioUrl = '';
      if (form.audio) {
        try {
          const audioInfo = await FileSystem.getInfoAsync(form.audio);
          if (!audioInfo.exists) {
            throw new Error('Audio file not found');
          }

          const audioStorageRef = ref(
            storage,
            `courses/${currentUser.uid}/audio/${Date.now()}-${audioName || 'audio.mp3'}`
          );

          // Create a fetch request to get the file
          const response = await fetch(form.audio);
          const blob = await response.blob();
          
          await uploadBytes(audioStorageRef, blob);
          audioUrl = await getDownloadURL(audioStorageRef);
        } catch (error: any) {
          console.error('Audio upload error:', error);
          Alert.alert('Error', error.message || 'Failed to upload audio');
          setIsLoading(false);
          return;
        }
      }

      // Create course document
      const coursesRef = collection(db, 'courses');
      const courseData = {
        title: form.title.trim(),
        description: form.description.trim(),
        duration: form.duration.trim(),
        price: form.price ? parseFloat(form.price) : 0,
        level: form.level,
        tags: form.tags.split(',').map(tag => tag.trim()),
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        teacherId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(coursesRef, courseData);
      Alert.alert('Success', 'Course created successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error creating course:', error);
      Alert.alert('Error', error.message || 'Failed to create course');
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
        <Text style={styles.headerTitle}>Post Course</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
            placeholder="Enter course title"
            placeholderTextColor="#666666"
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
            placeholder="Enter course description"
            placeholderTextColor="#666666"
            multiline
          />
          <Text style={styles.label}>Duration</Text>
          <TextInput
            style={styles.input}
            value={form.duration}
            onChangeText={(text) => setForm(prev => ({ ...prev, duration: text }))}
            placeholder="Enter course duration"
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
              {isLoading ? 'Posting...' : 'Post Course'}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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