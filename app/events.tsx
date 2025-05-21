import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useColorScheme } from 'react-native';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'live' | 'workshop' | 'retreat';
  date: Date;
  duration: string;
  maxParticipants: number;
  price: number;
  location: string;
  onlineLink: string;
  coverImage: string;
  createdAt: Date;
}

export default function EventsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const theme = {
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#2A2A2A',
    accent: '#00bfa5',
    card: '#232323',
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'eventsSunya');
      const q = query(eventsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const eventsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          type: data.type,
          date: data.date.toDate(),
          duration: data.duration,
          maxParticipants: data.maxParticipants,
          price: data.price,
          location: data.location,
          onlineLink: data.onlineLink,
          coverImage: data.coverImageUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167',
          createdAt: data.createdAt.toDate(),
        };
      });

      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to fetch events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.background}
      />
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.cardBackground }]}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Events</Text>
        <TouchableOpacity onPress={() => router.push('/create-event')} style={[styles.createButton, { backgroundColor: theme.cardBackground }]}>
          <Feather name="plus" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.background }]}>
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={48} color={theme.text} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No events found</Text>
            <TouchableOpacity
              style={[styles.createEventButton, { backgroundColor: theme.accent }]}
              onPress={() => router.push('/create-event')}
            >
              <Text style={styles.createEventButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventCard, { backgroundColor: theme.card }]}
              onPress={() => router.push(`/event-profile?id=${event.id}`)}
            >
              <Image source={{ uri: event.coverImage }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
                <Text style={[styles.eventDate, { color: theme.textSecondary }]}>{formatDate(event.date)}</Text>
                <Text style={[styles.eventLocation, { color: theme.textSecondary }]}>
                  {event.location || 'Online'}
                </Text>
                <View style={styles.eventFooter}>
                  <Text style={[styles.eventPrice, { color: theme.accent }]}>
                    {formatPrice(event.price)}
                  </Text>
                  <Text style={[styles.eventType, { color: theme.textSecondary }]}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  createButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  createEventButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  eventCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventType: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
}); 