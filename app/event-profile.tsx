import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import CrossPlatformMapView from './components/CrossPlatformMapView';

interface EventData {
  id: string;
  title: string;
  description: string;
  type: 'live' | 'workshop' | 'retreat';
  date: Date;
  duration: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  location: string;
  onlineLink: string | null;
  coverImageUrl: string | null;
  teacherId: string;
  teacherName?: string;
  teacherAvatar?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  endTime: Date;
}

export default function EventProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    fetchEventDetails();
    checkRegistrationStatus();
    requestLocationPermission();
  }, [id]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
  };

  const fetchEventDetails = async () => {
    try {
      const eventDoc = await getDoc(doc(db, 'eventsSunya', id as string));
      if (!eventDoc.exists()) {
        Alert.alert('Error', 'Event not found');
        router.back();
        return;
      }

      const eventData = eventDoc.data();
      
      // Fetch teacher details
      const teacherDoc = await getDoc(doc(db, 'users', eventData.teacherId));
      const teacherData = teacherDoc.data();

      // Get coordinates if location is provided
      let coordinates;
      if (eventData.location) {
        try {
          const locations = await Location.geocodeAsync(eventData.location);
          if (locations.length > 0) {
            coordinates = {
              latitude: locations[0].latitude,
              longitude: locations[0].longitude,
            };
          }
        } catch (error) {
          console.error('Error geocoding location:', error);
        }
      }

      setEvent({
        id: eventDoc.id,
        ...eventData,
        date: eventData.date.toDate(),
        teacherName: teacherData?.name || 'Unknown Teacher',
        teacherAvatar: teacherData?.avatarUrl,
        coordinates,
        endTime: eventData.endTime.toDate(),
      } as EventData);
    } catch (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsRegistered(userData.registeredEvents?.includes(id));
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Please sign in to register for events');
        return;
      }

      if (!event) return;

      // Check if event is full
      if (event.currentParticipants >= event.maxParticipants) {
        Alert.alert('Error', 'This event is full');
        return;
      }

      setIsLoading(true);

      // Update event participants
      await updateDoc(doc(db, 'eventsSunya', event.id), {
        currentParticipants: increment(1),
        registeredUsers: arrayUnion(currentUser.uid)
      });

      // Update user's registered events
      await updateDoc(doc(db, 'users', currentUser.uid), {
        registeredEvents: arrayUnion(event.id),
      });

      setIsRegistered(true);
      Alert.alert('Success', 'Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert('Error', 'Failed to register for event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMap = () => {
    if (!event?.coordinates) return;

    const { latitude, longitude } = event.coordinates;
    const label = encodeURIComponent(event.title || 'Event Location');
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;

    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Unable to open the map');
      console.error('Map open error:', err);
    });
  };

  const handleJoinOnline = () => {
    if (!event?.onlineLink) {
      Alert.alert('Error', 'No online link available for this event');
      return;
    }

    Linking.openURL(event.onlineLink);
  };

  if (isLoading || !event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.text }}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.card }]}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Event Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {event.coverImageUrl && (
          <Image
            source={{ uri: event.coverImageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
          
          <View style={styles.teacherInfo}>
            {event.teacherAvatar && (
              <Image
                source={{ uri: event.teacherAvatar }}
                style={styles.teacherAvatar}
              />
            )}
            <Text style={[styles.teacherName, { color: theme.textSecondary }]}>{event.teacherName}</Text>
          </View>

          <View style={[styles.detailsContainer, { backgroundColor: theme.card }]}>
            <View style={styles.detailRow}>
              <Feather name="calendar" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="clock" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Ends at {event.endTime.toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="map-pin" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {event.location || 'Online'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="users" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {event.currentParticipants} / {event.maxParticipants} participants
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="dollar-sign" size={20} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: theme.text }]}>{event.description}</Text>

          {event.coordinates && (
            <CrossPlatformMapView
              coordinates={event.coordinates}
              title={event.title}
              onPress={handleOpenMap}
            />
          )}

          {event.onlineLink && (
            <TouchableOpacity
              style={[styles.onlineButton, { backgroundColor: theme.accent }]}
              onPress={handleJoinOnline}
            >
              <Text style={[styles.onlineButtonText, { color: theme.background }]}>Join Online</Text>
            </TouchableOpacity>
          )}

          {!isRegistered && (
            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: theme.accent }]}
              onPress={handleRegister}
            >
              <Text style={[styles.registerButtonText, { color: theme.background }]}>Register for Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    marginLeft: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  onlineButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  onlineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 