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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

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
}

export default function EventProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

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
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${event.location}`,
      android: `geo:${latitude},${longitude}?q=${event.location}`,
    });

    if (url) {
      Linking.openURL(url);
    }
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
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
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.teacherInfo}>
            {event.teacherAvatar && (
              <Image
                source={{ uri: event.teacherAvatar }}
                style={styles.teacherAvatar}
              />
            )}
            <Text style={styles.teacherName}>{event.teacherName}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Feather name="calendar" size={20} color="#495057" />
              <Text style={styles.detailText}>
                {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="clock" size={20} color="#495057" />
              <Text style={styles.detailText}>{event.duration} minutes</Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="users" size={20} color="#495057" />
              <Text style={styles.detailText}>
                {event.currentParticipants}/{event.maxParticipants} participants
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Feather name="tag" size={20} color="#495057" />
              <Text style={styles.detailText}>${event.price}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{event.description}</Text>

          {event.location && (
            <>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.location}>{event.location}</Text>
              {event.coordinates && (
                <TouchableOpacity
                  style={styles.mapContainer}
                  onPress={handleOpenMap}
                >
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: event.coordinates.latitude,
                      longitude: event.coordinates.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: event.coordinates.latitude,
                        longitude: event.coordinates.longitude,
                      }}
                    />
                  </MapView>
                  <View style={styles.mapOverlay}>
                    <Text style={styles.mapOverlayText}>Tap to open in Maps</Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}

          {event.onlineLink && (
            <TouchableOpacity
              style={styles.onlineButton}
              onPress={handleJoinOnline}
            >
              <Feather name="video" size={20} color="#FFFFFF" />
              <Text style={styles.onlineButtonText}>Join Online</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.registerButton,
              isRegistered && styles.registeredButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={isRegistered || isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isRegistered ? 'Registered' : 'Register Now'}
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
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
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
    color: '#212529',
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
    color: '#495057',
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
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
    color: '#495057',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 24,
  },
  location: {
    fontSize: 15,
    color: '#495057',
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  onlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#228BE6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  onlineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: '#228BE6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  registeredButton: {
    backgroundColor: '#40C057',
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 