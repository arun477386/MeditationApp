import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Audio } from 'expo-av';

interface Course {
  id: string;
  title: string;
  author: string;
  rating: number;
  type: string;
  duration: string;
  isPlus: boolean;
  image: string;
  points: number;
  description?: string;
  audio?: string;
  createdAt?: any;
}

export default function CourseProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseDoc = await getDoc(doc(db, 'courses', id));
        if (courseDoc.exists()) {
          const data = courseDoc.data();
          setCourse({ 
            id: courseDoc.id, 
            ...data,
            image: data.imageUrl || data.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167',
            audio: data.audioUrl || data.audio
          } as Course);
        } else {
          Alert.alert('Error', 'Course not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        Alert.alert('Error', 'Failed to load course');
        router.back();
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && sound) {
      interval = setInterval(async () => {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded && status.durationMillis) {
            const currentProgress = status.positionMillis / status.durationMillis;
            setProgress(currentProgress);
            setDuration(status.durationMillis);
          }
        } catch (error) {
          console.error('Error getting playback status:', error);
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
    };
  }, [isPlaying, sound]);

  const handlePlayPause = async () => {
    if (!course?.audio) {
      Alert.alert('Error', 'No audio file available for this course');
      return;
    }

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: course.audio },
          { shouldPlay: true },
          onPlaybackStatusUpdate
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

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.durationMillis) {
      const currentProgress = status.positionMillis / status.durationMillis;
      setProgress(currentProgress);
      setDuration(status.durationMillis);
    }
  };

  if (!course) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <HeaderImageContainer>
        <ProfileImage source={{ uri: course.image }} resizeMode="cover" />
        <HeaderOverlay>
          <HeaderButton onPress={() => router.back()} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </HeaderButton>
          <HeaderIcons>
            <HeaderButton accessibilityLabel="Share">
              <Feather name="share-2" size={24} color="#fff" />
            </HeaderButton>
          </HeaderIcons>
        </HeaderOverlay>
      </HeaderImageContainer>
      <ContentScroll>
        <MetaRow>
          <MetaText>{course.rating} ★</MetaText>
          <MetaText>{course.type}</MetaText>
          <MetaText>{course.duration}</MetaText>
          {course.isPlus && <PlusBadge>Plus</PlusBadge>}
        </MetaRow>
        <TitleRow>
          <ProfileTitle>{course.title}</ProfileTitle>
          <TitleActions>
            <TouchableOpacity accessibilityLabel="More options">
              <Feather name="more-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Bookmark">
              <Feather name="bookmark" size={24} color="#fff" />
            </TouchableOpacity>
          </TitleActions>
        </TitleRow>
        <AuthorRow>
          <MetaText>By </MetaText>
          <AuthorLink accessibilityRole="link">
            {course.author}
          </AuthorLink>
        </AuthorRow>
        <DurationContainer>
          <DurationText>{formatDuration(duration)}</DurationText>
        </DurationContainer>
        <PlayButtonContainer>
          <PlayButton onPress={handlePlayPause}>
            <ProgressBar style={{ width: `${progress * 100}%` }} />
            <PlayButtonText>{isPlaying ? 'Pause' : 'Play'}</PlayButtonText>
          </PlayButton>
        </PlayButtonContainer>
        {course.description && (
          <DescriptionText>{course.description}</DescriptionText>
        )}
      </ContentScroll>
    </SafeAreaView>
  );
}

const HeaderImageContainer = styled.View`
  width: 100%;
  aspect-ratio: 16/9;
  position: relative;
`;

const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
`;

const HeaderOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 16px 0 16px;
`;

const HeaderButton = styled.TouchableOpacity`
  background: rgba(0,0,0,0.32);
  border-radius: 24px;
  padding: 8px;
  margin-right: 8px;
`;

const HeaderIcons = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ContentScroll = styled.ScrollView`
  flex: 1;
  background: #121212;
  padding: 0 0 24px 0;
`;

const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 20px 16px 0 16px;
`;

const MetaText = styled.Text`
  color: #fff;
  font-size: 16px;
  margin-right: 10px;
`;

const PlusBadge = styled.Text`
  color: #f4a62a;
  font-size: 16px;
  font-weight: 700;
  margin-left: 2px;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin: 12px 16px 0 16px;
`;

const ProfileTitle = styled.Text`
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  flex: 1;
`;

const TitleActions = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 8px;
`;

const AuthorRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 8px 16px 0 16px;
`;

const AuthorLink = styled.Text`
  color: #00bfa5;
  font-size: 16px;
  text-decoration: underline;
`;

const DurationContainer = styled.View`
  margin: 24px 16px 0 16px;
  align-items: center;
`;

const DurationText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const PlayButtonContainer = styled.View`
  margin: 8px 16px 0 16px;
`;

const PlayButton = styled.TouchableOpacity`
  background: rgba(0, 191, 165, 0.3);
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  position: relative;
  overflow: hidden;
`;

const PlayButtonText = styled.Text`
  color: #fff;
  font-size: 20px;
  font-weight: 700;
`;

const ProgressBar = styled.View`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #00bfa5;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
`;

const DescriptionText = styled.Text`
  color: #fff;
  font-size: 16px;
  margin: 12px 16px 0 16px;
`;

const formatDuration = (milliseconds: number): string => {
  if (!milliseconds) return '00:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}; 