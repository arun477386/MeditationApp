import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, useWindowDimensions, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface Track {
  id: string;
  title: string;
  author: string;
  rating: number;
  type: string;
  duration: string;
  image: string;
}

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
}

interface Teacher {
  id: string;
  name: string;
  avatar: string;
  location: string;
}

const TABS = ['Tracks', 'Courses', 'Teachers'] as const;
type Tab = typeof TABS[number];

export function MeditationScreen() {
  const [activeTab, setActiveTab] = React.useState<Tab>('Tracks');
  const colorScheme = useColorScheme() ?? 'light';
  const { width } = useWindowDimensions();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);

  const theme = Colors[colorScheme];

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleTrackPress = (track: Track) => {
    router.push({
      pathname: '/meditation/play/[id]',
      params: { id: track.id }
    });
  };

  const handleCoursePress = (course: Course) => {
    router.push({
      pathname: '/meditation/course/[id]',
      params: { id: course.id }
    });
  };

  const handleTeacherPress = (teacher: Teacher) => {
    router.push({
      pathname: '/meditation/teacher/[id]',
      params: { id: teacher.id }
    });
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      const querySnapshot = await getDocs(collection(db, 'teachers'));
      const teachersList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Get image URL with fallbacks
        let imageUrl = data.profilePicUrl || data.avatarUrl || data.avatar;
        
        // If the URL is a local file URI, use default image
        if (!imageUrl || imageUrl.startsWith('file://')) {
          imageUrl = 'https://randomuser.me/api/portraits/women/1.jpg';
        }

        return {
          id: doc.id,
          name: data.name,
          avatar: imageUrl,
          location: data.location,
        };
      }) as Teacher[];
      setTeachers(teachersList);
    };

    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const coursesList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Get image URL with fallbacks
        let imageUrl = data.imageUrl || data.thumbnailUrl || data.image;
        
        // If the URL is a local file URI, use default image
        if (!imageUrl || imageUrl.startsWith('file://')) {
          imageUrl = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167';
        }

        return {
          id: doc.id,
          title: data.title,
          author: data.author || 'Unknown Author',
          rating: data.rating || 4.5,
          type: 'Course',
          duration: data.duration,
          isPlus: data.isPlus || false,
          image: imageUrl,
          points: data.points || 0,
        };
      }) as Course[];
      setCourses(coursesList);
    };

    const fetchTracks = async () => {
      try {
        const meditationAppRef = doc(db, 'meditationApp', 'app');
        const musicTracksRef = collection(meditationAppRef, 'musicTracks');
        const querySnapshot = await getDocs(musicTracksRef);
        
        const tracksList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Get image URL with fallbacks
          let imageUrl = data.coverUrl || data.image || data.thumbnailUrl || data.imageUrl;
          
          // If the URL is a local file URI, use default image
          if (!imageUrl || imageUrl.startsWith('file://')) {
            imageUrl = 'https://randomuser.me/api/portraits/women/1.jpg';
          }

          console.log('Track data from Firebase:', {
            id: doc.id,
            title: data.title,
            imageUrl: imageUrl,
            rawData: data
          });

          return {
            id: doc.id,
            title: data.title,
            author: data.artistId, // We'll need to fetch the artist name separately if needed
            rating: data.rating || 4.5,
            type: data.type || 'Guided',
            duration: data.duration.toString(),
            image: imageUrl,
          };
        }) as Track[];
        console.log('Processed tracks list:', tracksList);
        setTracks(tracksList);
      } catch (error) {
        console.error('Error fetching tracks:', error);
        Alert.alert('Error', 'Failed to load tracks');
      }
    };

    fetchTeachers();
    fetchCourses();
    fetchTracks();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <TouchableOpacity 
            accessibilityRole="button" 
            accessibilityLabel="Go back" 
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.cardBackground
            }}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: '700' }}>Meditation</Text>
          <TouchableOpacity 
            accessibilityRole="button" 
            accessibilityLabel="Share"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.cardBackground
            }}
          >
            <Feather name="share-2" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 80 }}
        style={{ backgroundColor: theme.background }}
      >
        {/* Sticky Tabs */}
        <StickyTabsContainer style={{ backgroundColor: theme.background }}>
          <TabRow>
            {TABS.map(tab => (
              <TabButton
                key={tab}
                isActive={activeTab === tab}
                onPress={() => handleTabPress(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: activeTab === tab }}
                activeOpacity={0.7}
              >
                <TabText isActive={activeTab === tab}>{tab}</TabText>
              </TabButton>
            ))}
          </TabRow>
        </StickyTabsContainer>

        {/* Content */}
        {activeTab === 'Tracks' && (
          <>
            <SectionTitle style={{ color: theme.text }}>Recommended</SectionTitle>
            {tracks.map(track => (
              <TrackCard key={track.id} onPress={() => handleTrackPress(track)}>
                <TrackImage source={{ uri: track.image }} resizeMode="cover" />
                <TrackInfo>
                  <TrackMeta>
                    <TrackRating>{track.rating} ★</TrackRating>
                    <TrackType>{track.type}</TrackType>
                    <TrackDuration>{track.duration}</TrackDuration>
                  </TrackMeta>
                  <TrackTitle>{track.title}</TrackTitle>
                  <TrackAuthor>{track.author}</TrackAuthor>
                </TrackInfo>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="More options">
                  <Feather name="more-horizontal" size={22} color="#fff" />
                </TouchableOpacity>
              </TrackCard>
            ))}
          </>
        )}
        {activeTab === 'Courses' && (
          <>
            {courses.map(course => (
              <CourseCardContainer 
                key={course.id}
                onPress={() => handleCoursePress(course)}
              >
                <CourseImageWrapper>
                  <CourseImage source={{ uri: course.image }} resizeMode="cover" />
                  <PlayButton>
                    <Ionicons name="play" size={28} color="#fff" />
                  </PlayButton>
                </CourseImageWrapper>
                <CourseMetaRow>
                  <CourseRating>{course.rating} ★</CourseRating>
                  <CourseType>{course.type}</CourseType>
                  <CourseDuration>{course.duration}</CourseDuration>
                  {course.isPlus && <CoursePlus>Plus</CoursePlus>}
                </CourseMetaRow>
                <CourseTitle>{course.title}</CourseTitle>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingHorizontal: 16 }}>
                  <CourseAuthor style={{ marginLeft: 0 }}>{course.author}</CourseAuthor>
                  <TouchableOpacity 
                    accessibilityRole="button" 
                    accessibilityLabel="More options"
                    onPress={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Feather name="more-horizontal" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
                <CourseActionsRow>
                  {course.points > 0 && (
                    <CoursePointsButton>
                      <PointsText>{course.points}</PointsText>
                    </CoursePointsButton>
                  )}
                </CourseActionsRow>
              </CourseCardContainer>
            ))}
          </>
        )}
        {activeTab === 'Teachers' && (
          <>
            <View style={styles.teachersContainer}>
              {teachers.map(teacher => (
                <TeacherRow key={teacher.id} onPress={() => handleTeacherPress(teacher)}>
                  <TeacherAvatar source={{ uri: teacher.avatar || 'default_image_url' }} />
                  <TeacherInfo>
                    <TeacherName>{teacher.name}</TeacherName>
                    <TeacherLocation>{teacher.location}</TeacherLocation>
                  </TeacherInfo>
                  <FollowButton>
                    <FollowButtonText>Follow</FollowButtonText>
                  </FollowButton>
                </TeacherRow>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      {/* <BottomNav style={{ backgroundColor: theme.bottomNav }}>
        <NavItem accessibilityRole="button" accessibilityLabel="Home" onPress={() => router.push('/')}> 
          <Ionicons name="home-outline" size={24} color="#fff" />
          <NavText>Home</NavText>
        </NavItem>
        <NavItem accessibilityRole="button" accessibilityLabel="Library" onPress={() => router.push('/library')}>
          <Ionicons name="search-outline" size={24} color="#fff" />
          <NavText>Library</NavText>
        </NavItem>
        <NavItem accessibilityRole="button" accessibilityLabel="Timer" onPress={() => router.push('/timer')}>
          <Ionicons name="time-outline" size={24} color="#fff" />
          <NavText>Timer</NavText>
        </NavItem>
        <NavItem accessibilityRole="button" accessibilityLabel="Teachers" onPress={() => router.push('/teachers')}>
          <Ionicons name="book-outline" size={24} color="#fff" />
          <NavText>Teachers</NavText>
        </NavItem>
        <NavItem accessibilityRole="button" accessibilityLabel="Saved" onPress={() => router.push('/saved')}>
          <Ionicons name="bookmark-outline" size={24} color="#fff" />
          <NavText>Saved</NavText>
        </NavItem>
      </BottomNav> */}
    </SafeAreaView>
  );
}

const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.background};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${({ theme }) => theme.background};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border};
`;

const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  font-weight: 600;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 32px;
  font-weight: 700;
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  margin: 8px 16px 0 16px;
`;

const TabRow = styled.View`
  flex-direction: row;
  margin: 24px 0 0 0;
  padding: 0 16px;
`;

const TabButton = styled.TouchableOpacity<{ isActive: boolean }>`
  margin-right: 24px;
  border-bottom-width: 2px;
  border-bottom-color: ${({ isActive, theme }) => (isActive ? theme.text : 'transparent')};
  padding-bottom: 4px;
  min-width: 60px;
`;

const TabText = styled.Text<{ isActive: boolean }>`
  color: ${({ isActive, theme }) => (isActive ? theme.text : theme.textSecondary)};
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: 600;
  margin: 24px 16px 16px;
`;

const TrackCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  margin: 0 16px 16px 16px;
  padding: 12px;
`;

const TrackImage = styled.Image`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  margin-right: 12px;
`;

const TrackInfo = styled.View`
  flex: 1;
`;

const TrackMeta = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 2px;
`;

const TrackRating = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  margin-right: 8px;
`;

const TrackType = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  margin-right: 8px;
`;

const TrackDuration = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
`;

const TrackTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 700;
`;

const TrackAuthor = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`;

const PlaylistRow = styled.View`
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  margin: 0 16px 16px 16px;
  padding: 12px;
`;

const PlaylistThumbs = styled.View`
  flex-direction: row;
`;

const PlaylistThumb = styled.Image`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  margin-right: -8px;
  border-width: 2px;
  border-color: #121212;
`;

const PlaylistInfo = styled.View`
  margin-left: 12px;
`;

const PlaylistTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 600;
`;

const PointsButton = styled.View`
  background: ${({ theme }) => theme.accent};
  border-radius: 20px;
  padding: 8px 20px;
  align-items: center;
  justify-content: center;
`;

const PointsText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 700;
`;

const BottomNav = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.surface};
  padding: 8px 0 8px 0;
`;

const NavItem = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
`;

const NavText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 12px;
  margin-top: 2px;
`;

const CourseCardContainer = styled.TouchableOpacity`
  background: ${({ theme }) => theme.card};
  border-radius: 20px;
  margin: 0 16px 24px 16px;
  padding: 0 0 16px 0;
`;

const CourseImageWrapper = styled.View`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  overflow: hidden;
`;

const CourseImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const PlayButton = styled.View`
  position: absolute;
  left: 16px;
  bottom: 16px;
  background: rgba(0,0,0,0.4);
  border-radius: 8px;
  padding: 6px 8px;
`;

const CourseMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 16px 0 0 16px;
`;

const CourseRating = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  margin-right: 8px;
`;

const CourseType = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  margin-right: 8px;
`;

const CourseDuration = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  margin-right: 8px;
`;

const CoursePlus = styled.Text`
  color: ${({ theme }) => theme.plus};
  font-size: 15px;
  font-weight: 700;
  margin-left: 2px;
`;

const CourseTitle = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 22px;
  font-weight: 700;
  margin: 8px 0 0 16px;
`;

const CourseAuthor = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  margin: 0;
`;

const CourseActionsRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 16px 16px 0 16px;
`;

const CoursePointsButton = styled.View`
  background: ${({ theme }) => theme.accent};
  border-radius: 20px;
  padding: 8px 20px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const TeacherRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background: transparent;
  margin: 0 16px 24px 16px;
`;

const TeacherAvatar = styled.Image`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  margin-right: 16px;
`;

const TeacherInfo = styled.View`
  flex: 1;
`;

const TeacherName = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  font-weight: 700;
`;

const TeacherLocation = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 15px;
`;

const FollowButton = styled.TouchableOpacity`
  background: ${({ theme }) => theme.accent};
  border-radius: 8px;
  padding: 8px 24px;
  align-items: center;
  justify-content: center;
`;

const FollowButtonText = styled.Text`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 700;
`;

const StickyTabsContainer = styled.View`
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.background};
`;

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  teachersContainer: {
    padding: 16,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
  },
  teacherImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  teacherName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  teacherBio: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default MeditationScreen;