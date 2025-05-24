import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import { Image as UIImage } from '@/components/ui/Image';

interface Track {
  id: string;
  title: string;
  author: string;
  image: string;
  audio: string;
  duration: string;
}

export default function PlayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const trackDoc = await getDoc(doc(db, 'tracks', id));
        if (trackDoc.exists()) {
          const data = trackDoc.data();
          setTrack({
            id: trackDoc.id,
            title: data.title,
            author: data.author,
            image: data.imageUrl || data.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167',
            audio: data.audioUrl || data.audio,
            duration: data.duration || '',
          });
        } else {
          Alert.alert('Error', 'Track not found');
          router.back();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load track');
        router.back();
      }
    };
    fetchTrack();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (isPlaying && sound) {
      intervalRef.current = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setProgress(status.positionMillis / status.durationMillis);
          setDuration(status.durationMillis);
          setPosition(status.positionMillis);
        }
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, sound]);

  const handlePlayPause = async () => {
    if (!track?.audio) {
      Alert.alert('Error', 'No audio file available for this track');
      return;
    }

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.playAsync();
            setIsPlaying(true);
          } else {
            // If sound is not loaded, create a new instance
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: track.audio },
              { shouldPlay: true },
            );
            setSound(newSound);
            setIsPlaying(true);
          }
        }
      } else {
        // Stop any existing playback
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: track.audio },
          { shouldPlay: true },
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
      setSound(null);
      setIsPlaying(false);
    }
  };

  const handleBack = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
    router.back();
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleBack} accessibilityLabel="Close">
          <Feather name="x" size={32} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.donateText}>Donate</Text>
        <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Share">
          <Feather name="upload" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <UIImage 
        source={{ uri: track.image }} 
        style={styles.image} 
        contentFit="cover"
        fallbackSource={{ uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
      />
      <View style={styles.durationLargeRow}>
        <Text style={styles.durationLarge}>{formatDuration(duration)}</Text>
      </View>
      <Text style={styles.title}>{track.title}</Text>
      <Text style={styles.author}>{track.author}</Text>
      <View style={styles.progressBarRow}>
        <Text style={styles.progressTime}>{formatDuration(position)}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressTime}>{formatDuration(duration)}</Text>
      </View>
      <View style={styles.controlsRow}>
        <Feather name="music" size={28} color="#fff" style={styles.icon} />
        <Feather name="rotate-ccw" size={28} color="#fff" style={styles.icon} />
        <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause} accessibilityLabel="Play/Pause">
          <Feather name={isPlaying ? 'pause' : 'play'} size={40} color="#fff" />
        </TouchableOpacity>
        <Feather name="rotate-cw" size={28} color="#fff" style={styles.icon} />
        <Feather name="repeat" size={28} color="#fff" style={styles.icon} />
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.feelingText}>How are you feeling?</Text>
        <View style={styles.sliderTrack}>
          <View style={styles.sliderThumb} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7a5a3a',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  headerBtn: {
    backgroundColor: '#fff2',
    borderRadius: 16,
    padding: 8,
  },
  donateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  image: {
    width: width,
    height: width * 0.56,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  durationLargeRow: {
    alignItems: 'flex-start',
    marginTop: 16,
    marginLeft: 16,
  },
  durationLarge: {
    color: '#fff',
    fontSize: 54,
    fontWeight: '700',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 16,
    marginTop: 8,
  },
  author: {
    color: '#e0d3c2',
    fontSize: 18,
    marginLeft: 16,
    marginTop: 2,
    marginBottom: 12,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  progressTime: {
    color: '#fff',
    fontSize: 14,
    width: 40,
    textAlign: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#fff3',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    gap: 24,
  },
  playBtn: {
    backgroundColor: '#fff2',
    borderRadius: 32,
    padding: 12,
    marginHorizontal: 12,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    opacity: 0.7,
    width: 28,
    height: 28,
    textAlign: 'center',
  },
  bottomRow: {
    marginTop: 32,
    alignItems: 'center',
  },
  feelingText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
  },
  sliderTrack: {
    width: width * 0.7,
    height: 6,
    backgroundColor: '#fff3',
    borderRadius: 3,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    position: 'absolute',
    left: width * 0.35 - 12,
    top: -9,
  },
}); 