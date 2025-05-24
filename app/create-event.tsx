import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, storage, auth } from '@/services/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';

export default function CreateEventScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'live' as 'live' | 'workshop' | 'retreat',
    endTime: new Date(),
    maxParticipants: '',
    price: '',
    location: '',
    onlineLink: '',
    coverImage: null as string | null,
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setForm(prev => ({ ...prev, endTime: selectedTime }));
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Validate image size
        const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
        if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > 2 * 1024 * 1024) { // 2MB limit
          Alert.alert('Error', 'Image size should be less than 2MB');
          return;
        }

        setForm(prev => ({ ...prev, coverImage: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create an event');
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
        Alert.alert('Error', 'Only teachers can create events');
        return;
      }

      // Upload image if selected
      let coverImageUrl = '';
      if (form.coverImage) {
        try {
          const imageInfo = await FileSystem.getInfoAsync(form.coverImage);
          if (!imageInfo.exists) {
            throw new Error('Image file not found');
          }

          const imageStorageRef = ref(
            storage,
            `eventsSunya/${currentUser.uid}/images/${Date.now()}-cover.jpg`
          );

          // Create a fetch request to get the file
          const response = await fetch(form.coverImage);
          const blob = await response.blob();
          
          await uploadBytes(imageStorageRef, blob);
          coverImageUrl = await getDownloadURL(imageStorageRef);
        } catch (error: any) {
          console.error('Image upload error:', error);
          Alert.alert('Error', error.message || 'Failed to upload image');
          setIsLoading(false);
          return;
        }
      }

      // Create event document
      const eventsRef = collection(db, 'eventsSunya');
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        date: date,
        endTime: form.endTime,
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : 0,
        price: form.price ? parseFloat(form.price) : 0,
        location: form.location.trim() || null,
        onlineLink: form.onlineLink.trim() || null,
        coverImageUrl: coverImageUrl || null,
        teacherId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        registeredUsers: [], // Initialize empty array for registered users
        currentParticipants: 0 // Initialize current participants count
      };

      await addDoc(eventsRef, eventData);
      Alert.alert('Success', 'Event created successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Event</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Cover Image</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {form.coverImage ? (
              <Image source={{ uri: form.coverImage }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholder}>
                <Feather name="image" size={24} color="#666" />
                <Text style={styles.placeholderText}>Select Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(value) => handleChange('title', value)}
            placeholder="Event Title"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(value) => handleChange('description', value)}
            placeholder="Event Description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeContainer}>
            {['live', 'workshop', 'retreat'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  form.type === type && styles.typeButtonActive
                ]}
                onPress={() => handleChange('type', type)}
              >
                <Text style={[
                  styles.typeButtonText,
                  form.type === type && styles.typeButtonTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={[styles.datePicker, { flex: 1, marginRight: 8 }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: '#212529' }}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePicker, { flex: 1, marginLeft: 8 }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={{ color: '#212529' }}>{date.toLocaleTimeString()}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <>
              {Platform.OS === 'android' ? (
                <DateTimePicker
                  value={date}
                  mode="date"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              ) : (
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  onChange={handleDateChange}
                />
              )}
            </>
          )}

          {showTimePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const updated = new Date(date);
                  updated.setHours(selectedTime.getHours());
                  updated.setMinutes(selectedTime.getMinutes());
                  setDate(updated);
                }
              }}
            />
          )}

          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={{ color: '#212529' }}>{form.endTime.toLocaleTimeString()}</Text>
          </TouchableOpacity>

          {showEndTimePicker && (
            <DateTimePicker
              value={form.endTime}
              mode="time"
              onChange={handleEndTimeChange}
            />
          )}

          <Text style={styles.label}>Max Participants</Text>
          <TextInput
            style={styles.input}
            value={form.maxParticipants}
            onChangeText={(value) => handleChange('maxParticipants', value)}
            placeholder="Maximum number of participants"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Price ($)</Text>
          <TextInput
            style={styles.input}
            value={form.price}
            onChangeText={(value) => handleChange('price', value)}
            placeholder="Price in USD"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={form.location}
            onChangeText={(value) => handleChange('location', value)}
            placeholder="Event location"
          />

          <Text style={styles.label}>Online Link</Text>
          <TextInput
            style={styles.input}
            value={form.onlineLink}
            onChangeText={(value) => handleChange('onlineLink', value)}
            placeholder="Online meeting link (if applicable)"
          />

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.submitButtonText}>Creating...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Create Event</Text>
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
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#212529',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeButtonActive: {
    backgroundColor: '#228BE6',
    borderColor: '#228BE6',
  },
  typeButtonText: {
    color: '#495057',
    fontSize: 15,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  datePicker: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  imagePicker: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  placeholderText: {
    marginTop: 8,
    color: '#868E96',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#228BE6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 