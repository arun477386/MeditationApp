import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export default function TeacherProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeacher() {
      if (!id) return;
      const ref = doc(db, 'teachers', String(id));
      const snap = await getDoc(ref);
      if (snap.exists()) setTeacher({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    fetchTeacher();
  }, [id]);

  if (loading || !teacher) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <HeaderRow>
        <HeaderButton onPress={() => router.back()} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </HeaderButton>
        <HeaderIcons>
          <HeaderButton accessibilityLabel="Instagram">
            <Ionicons name="logo-instagram" size={24} color="#fff" />
          </HeaderButton>
          <HeaderButton accessibilityLabel="Share">
            <Feather name="share-2" size={24} color="#fff" />
          </HeaderButton>
        </HeaderIcons>
      </HeaderRow>
      <ProfileContainer>
        <Avatar source={{ uri: teacher.profilePicUrl || teacher.avatar || 'default_image_url' }} />
        <ProfileInfo>
          <ProfileName>{teacher.name}</ProfileName>
          <ProfileLocation>{teacher.location}</ProfileLocation>
          <ProfileFollowers>{teacher.followers ? teacher.followers + ' followers' : ''}</ProfileFollowers>
        </ProfileInfo>
        <FollowButton>
          <FollowButtonText>Follow</FollowButtonText>
        </FollowButton>
      </ProfileContainer>
      <TabsRow>
        {(teacher.tabs || ['Home', 'Tracks', 'Courses', 'Events', 'About']).map((tab: string) => (
          <TabButton key={tab} isActive={tab === (teacher.activeTab || 'Home')}>
            <TabText isActive={tab === (teacher.activeTab || 'Home')}>{tab}</TabText>
          </TabButton>
        ))}
      </TabsRow>
      <TabUnderline />
      <ContentScroll showsVerticalScrollIndicator={false}>
        <SectionTitle>Challenges</SectionTitle>
        {(teacher.challenges || []).map((challenge: any) => (
          <ChallengeCard key={challenge.id}>
            <ChallengeImage source={{ uri: challenge.image }} />
            <ChallengeInfo>
              <ChallengeSubtitle>{challenge.subtitle}</ChallengeSubtitle>
              <ChallengeTitle>{challenge.title}</ChallengeTitle>
              <ChallengeJoined>{challenge.joined} joined this challenge</ChallengeJoined>
            </ChallengeInfo>
          </ChallengeCard>
        ))}
        <SectionTitle style={{ marginTop: 32 }}>Teacher updates</SectionTitle>
        {(teacher.updates || []).map((update: any) => (
          <UpdateBlock key={update.id}>
            <UpdateHeader>
              <UpdateAvatar source={{ uri: update.avatar }} />
              <UpdateText>
                <UpdateName>{update.teacher}</UpdateName> {update.action} · {update.time}
              </UpdateText>
            </UpdateHeader>
            <UpdateTrackCard>
              <UpdateTrackImage source={{ uri: update.track.image }} />
              <UpdateTrackInfo>
                <UpdateTrackMeta>
                  <UpdateTrackRating>{update.track.rating} ★</UpdateTrackRating>
                  <UpdateTrackType>{update.track.type}</UpdateTrackType>
                  <UpdateTrackDuration>{update.track.duration}</UpdateTrackDuration>
                  {update.track.plus && <UpdateTrackPlus>Plus</UpdateTrackPlus>}
                </UpdateTrackMeta>
                <UpdateTrackTitle>{update.track.title}</UpdateTrackTitle>
                <UpdateTrackAuthor>{update.track.author}</UpdateTrackAuthor>
              </UpdateTrackInfo>
            </UpdateTrackCard>
          </UpdateBlock>
        ))}
        <SeeMoreButton>
          <SeeMoreButtonText>See more</SeeMoreButtonText>
        </SeeMoreButton>
      </ContentScroll>
    </SafeAreaView>
  );
}

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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
const ProfileContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 24px 16px 0 16px;
`;
const Avatar = styled.Image`
  width: 96px;
  height: 96px;
  border-radius: 48px;
  margin-right: 20px;
`;
const ProfileInfo = styled.View`
  flex: 1;
`;
const ProfileName = styled.Text`
  color: #fff;
  font-size: 28px;
  font-weight: 700;
`;
const ProfileLocation = styled.Text`
  color: #aaa;
  font-size: 16px;
`;
const ProfileFollowers = styled.Text`
  color: #aaa;
  font-size: 16px;
  margin-top: 2px;
`;
const FollowButton = styled.TouchableOpacity`
  background: #00bfa5;
  border-radius: 8px;
  padding: 12px 32px;
  align-items: center;
  justify-content: center;
`;
const FollowButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
`;
const TabsRow = styled.View`
  flex-direction: row;
  margin: 32px 0 0 0;
  padding: 0 16px;
`;
const TabButton = styled.TouchableOpacity<{ isActive: boolean }>`
  margin-right: 24px;
  padding-bottom: 4px;
`;
const TabText = styled.Text<{ isActive: boolean }>`
  color: ${({ isActive }) => (isActive ? '#fff' : '#aaa')};
  font-size: 18px;
  font-weight: 600;
`;
const TabUnderline = styled.View`
  height: 2px;
  background: #fff;
  width: 48px;
  margin-left: 16px;
  margin-bottom: 8px;
`;
const ContentScroll = styled.ScrollView`
  flex: 1;
  background: #121212;
`;
const SectionTitle = styled.Text`
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 24px 16px 16px 16px;
`;
const ChallengeCard = styled.View`
  flex-direction: row;
  align-items: center;
  background: #232323;
  border-radius: 16px;
  margin: 0 16px 16px 16px;
  padding: 12px;
`;
const ChallengeImage = styled.Image`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  margin-right: 12px;
`;
const ChallengeInfo = styled.View`
  flex: 1;
`;
const ChallengeSubtitle = styled.Text`
  color: #fff;
  font-size: 15px;
  margin-bottom: 2px;
`;
const ChallengeTitle = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
`;
const ChallengeJoined = styled.Text`
  color: #aaa;
  font-size: 14px;
`;
const UpdateBlock = styled.View`
  margin: 0 0 24px 0;
`;
const UpdateHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 0 16px 8px 16px;
`;
const UpdateAvatar = styled.Image`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  margin-right: 8px;
`;
const UpdateText = styled.Text`
  color: #aaa;
  font-size: 15px;
`;
const UpdateName = styled.Text`
  color: #fff;
  font-weight: 700;
`;
const UpdateTrackCard = styled.View`
  background: #232323;
  border-radius: 16px;
  margin: 0 16px;
  overflow: hidden;
`;
const UpdateTrackImage = styled.Image`
  width: 100%;
  height: 160px;
`;
const UpdateTrackInfo = styled.View`
  padding: 12px;
`;
const UpdateTrackMeta = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
`;
const UpdateTrackRating = styled.Text`
  color: #fff;
  font-size: 14px;
  margin-right: 8px;
`;
const UpdateTrackType = styled.Text`
  color: #fff;
  font-size: 14px;
  margin-right: 8px;
`;
const UpdateTrackDuration = styled.Text`
  color: #fff;
  font-size: 14px;
  margin-right: 8px;
`;
const UpdateTrackPlus = styled.Text`
  color: #f4a62a;
  font-size: 14px;
  font-weight: 700;
  margin-left: 2px;
`;
const UpdateTrackTitle = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  margin-top: 8px;
`;
const UpdateTrackAuthor = styled.Text`
  color: #aaa;
  font-size: 14px;
`;
const SeeMoreButton = styled.TouchableOpacity`
  background: #232323;
  border-radius: 10px;
  margin: 0 16px 32px 16px;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
`;
const SeeMoreButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: 600;
`;