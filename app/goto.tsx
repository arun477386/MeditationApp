import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function GoToScreen() {
  const router = useRouter();

  const handleOptionPress = (option: string) => {
    console.log(`Option pressed: ${option}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GoTo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/meditation')}
          >
            <Feather name="headphones" size={24} color="#FFFFFF" />
            <Text style={styles.menuText}>Meditation</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/library')}
          >
            <Feather name="book" size={24} color="#FFFFFF" />
            <Text style={styles.menuText}>Library</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/timer')}
          >
            <Feather name="clock" size={24} color="#FFFFFF" />
            <Text style={styles.menuText}>Timer</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/teachers')}
          >
            <Feather name="users" size={24} color="#FFFFFF" />
            <Text style={styles.menuText}>Teachers</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/create-teacher')}
          >
            <Feather name="user-plus" size={24} color="#FFFFFF" />
            <Text style={styles.menuText}>Create Teacher</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={() => router.push('/create-course' as any)}
          >
            <Text style={styles.optionText}>Post Course</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={() => router.push('/upload-track' as any)}
          >
            <Text style={styles.optionText}>Upload Track</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={() => router.push('/create-event' as any)}
          >
            <Text style={styles.optionText}>Create Event</Text>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  menuText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  optionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 16,
  },
}); 