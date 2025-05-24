import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Audio } from 'expo-av';

interface Track {
  id: string;
  title: string;
  author: string;
  image: string;
  rating: number;
  type: string;
  duration: string;
  audio: string;
  description?: string;
  plays?: number;
  createdAt?: any;
}

export default function MeditationProfileDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [track, setTrack] = useState<Track | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const trackDoc = await getDoc(doc(db, 'tracks', id));
        if (trackDoc.exists()) {
          const data = trackDoc.data();
          // Get image URL with fallbacks
          let imageUrl = data.image || data.thumbnailUrl || data.imageUrl;
          
          // If the URL is a local file URI or invalid, use default image
          if (!imageUrl || imageUrl.startsWith('file://')) {
            imageUrl = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167';
          }

          console.log('Track data from Firebase:', {
            id: trackDoc.id,
            title: data.title,
            imageUrl: imageUrl,
            rawData: data
          });

          setTrack({ 
            id: trackDoc.id, 
            ...data,
            image: imageUrl
          } as Track);
        } else {
          Alert.alert('Error', 'Track not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching track:', error);
        Alert.alert('Error', 'Failed to load track');
        router.back();
      }
    };

    fetchTrack();
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
      if (sound) sound.unloadAsync();
    };
  }, [isPlaying, sound]);

  const handlePlayPause = async () => {
    if (!track?.audio) {
      Alert.alert('Error', 'No audio file available');
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
          { uri: track.audio },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  if (!track) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <HeaderImageContainer>
        <ProfileImage source={{ uri: track.image }} resizeMode="cover" />
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
          <MetaText>{track.rating} ★</MetaText>
          <MetaText>{track.type}</MetaText>
          <MetaText>{track.duration}</MetaText>
          <TouchableOpacity accessibilityLabel="Bookmark" style={{ marginLeft: 'auto' }}>
            <Feather name="bookmark" size={24} color="#fff" />
          </TouchableOpacity>
        </MetaRow>
        <TitleRow>
          <ProfileTitle>{track.title}</ProfileTitle>
          <TitleActions>
            <TouchableOpacity accessibilityLabel="More options">
              <Feather name="more-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </TitleActions>
        </TitleRow>
        <AuthorRow>
          <MetaText>By </MetaText>
          <AuthorLink accessibilityRole="link">
            {track.author}
          </AuthorLink>
        </AuthorRow>
        <PlayButtonContainer>
          <PlayButton onPress={() => router.push(`/meditation/play/${track.id}`)}>
            <ProgressBar style={{ width: `${progress * 100}%` }} />
            <PlayButtonText>Play</PlayButtonText>
          </PlayButton>
        </PlayButtonContainer>
        {track.description && (
          <DescriptionText>{track.description}</DescriptionText>
        )}
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

const PlayButtonContainer = styled.View`
  margin: 24px 16px 0 16px;
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

const DescriptionText = styled.Text`
  color: #fff;
  font-size: 16px;
  margin: 12px 16px 0 16px;
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