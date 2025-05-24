import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Audio } from 'expo-av';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { typography, elementSizes } from '@/app/theme/sizes';

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
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

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
      } finally {
        setIsLoading(false);
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
          setIsPlaying(false);
        } else {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.playAsync();
            setIsPlaying(true);
          } else {
            // If sound is not loaded, create a new instance
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: course.audio },
              { shouldPlay: true },
              onPlaybackStatusUpdate
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

  if (isLoading || !course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <HeaderImageContainer>
        <ProfileImage source={{ uri: course.image }} resizeMode="cover" />
        <HeaderOverlay>
          <HeaderButton onPress={handleBack} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={28} color={theme.icon} />
          </HeaderButton>
          <HeaderIcons>
            <HeaderButton accessibilityLabel="Share">
              <Feather name="share-2" size={24} color={theme.icon} />
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
          <TouchableOpacity accessibilityLabel="Bookmark" style={{ marginLeft: 'auto' }}>
            <Feather name="bookmark" size={24} color={theme.icon} />
          </TouchableOpacity>
        </MetaRow>
        <TitleRow>
          <ProfileTitle>{course.title}</ProfileTitle>
          <TitleActions>
            <TouchableOpacity accessibilityLabel="More options">
              <Feather name="more-horizontal" size={24} color={theme.icon} />
            </TouchableOpacity>
          </TitleActions>
        </TitleRow>
        <AuthorRow>
          <MetaText>By </MetaText>
          <AuthorLink accessibilityRole="link">
            {course.author}
          </AuthorLink>
        </AuthorRow>
        <DescriptionText>{course.description}</DescriptionText>
        
        {course.audio && (
          <PlayPauseButton onPress={handlePlayPause} accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={theme.background} />
            <PlayPauseButtonText>{isPlaying ? 'Pause Audio' : 'Play Audio'}</PlayPauseButtonText>
          </PlayPauseButton>
        )}

        {course.audio && duration > 0 && (
          <ProgressBarContainer>
            <ProgressBarBg>
              <ProgressBar fill={progress} />
            </ProgressBarBg>
            <ProgressTime>{formatDuration(Math.round(duration * progress / 1000))}</ProgressTime>
            <ProgressTime>{formatDuration(Math.round(duration / 1000))}</ProgressTime>
          </ProgressBarContainer>
        )}

        <NotesSection>
          <NotesTitle>My Notes</NotesTitle>
          <NotesInput
            placeholder="Add your notes here..."
            placeholderTextColor={theme.textSecondary}
            multiline
          />
          <ListenAgainButton>
            <ListenAgainButtonText>Listen Again</ListenAgainButtonText>
          </ListenAgainButton>
        </NotesSection>

        {/* About Section */}
        <AboutSection>
          <AboutTitle>About This Course</AboutTitle>
          <AboutText>{course.description}</AboutText>
        </AboutSection>

      </ContentScroll>
    </SafeAreaView>
  );
}

const HeaderImageContainer = styled.View`
  width: 100%;
  aspect-ratio: 1.6;
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
  right: 0;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 18px 16px 0 16px;
`;

const HeaderButton = styled.TouchableOpacity`
  background: ${({ theme }) => theme.icon + '33'};
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
  background: ${({ theme }) => theme.background};
  padding: 0 0 24px 0;
`;

const MetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 20px 16px 0 16px;
`;

const MetaText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  margin-right: 10px;
`;

const PlusBadge = styled.View`
  background: ${({ theme }) => theme.plus};
  border-radius: 4px;
  padding: 2px 6px;
  margin-left: 8px;
`;

const PlusBadgeText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 12px;
  font-weight: 700;
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin: 12px 16px 0 16px;
`;

const ProfileTitle = styled.Text`
  color: ${({ theme }) => theme.text};
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
  color: ${({ theme }) => theme.accent};
  font-size: 16px;
  text-decoration: underline;
`;

const DescriptionText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  margin: 12px 16px 0 16px;
`;

const PlayPauseButton = styled.TouchableOpacity`
  background: ${({ theme }) => theme.accent};
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  margin: 24px 16px 0 16px;
`;

const PlayPauseButtonText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 18px;
  font-weight: 700;
  margin-left: 8px;
`;

const ProgressBarContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 16px;
`;

const ProgressBarBg = styled.View`
  flex: 1;
  height: 6px;
  background: ${({ theme }) => theme.border};
  border-radius: 3px;
  margin: 0 8px;
  overflow: hidden;
`;

const ProgressBar = styled.View<{ fill: number }>`
  width: ${({ fill }) => `${fill * 100}%`};
  height: 100%;
  background: ${({ theme }) => theme.accent};
  border-radius: 3px;
`;

const ProgressTime = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`;

const NotesSection = styled.View`
  margin: 24px 16px 0 16px;
  padding: 16px;
  background: ${({ theme }) => theme.card};
  border-radius: 8px;
`;

const NotesTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const NotesInput = styled.TextInput`
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border-radius: 4px;
  padding: 12px;
  min-height: 80px;
  textAlignVertical: top;
  borderWidth: 1px;
  borderColor: ${({ theme }) => theme.border};
`;

const ListenAgainButton = styled.TouchableOpacity`
  background: ${({ theme }) => theme.accent};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  margin-top: 16px;
`;

const ListenAgainButtonText = styled.Text`
  color: ${({ theme }) => theme.background};
  font-size: 16px;
  font-weight: 700;
`;

const AboutSection = styled.View`
  margin: 24px 16px 0 16px;
  padding: 16px;
  background: ${({ theme }) => theme.card};
  border-radius: 8px;
`;

const AboutTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const AboutText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  line-height: 24px;
`;

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${formattedMinutes}:${formattedSeconds}`;
}; 