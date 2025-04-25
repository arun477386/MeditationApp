export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    dailyReminder: boolean;
    friendRequests: boolean;
    courseUpdates: boolean;
  };
}

export interface User {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  location: string;
  timezone: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface MeditationSession {
  userId: string;
  durationMinutes: number;
  startedAt: Date;
  endedAt: Date;
  device: string;
  location: {
    lat: number;
    lng: number;
  };
  sessionType: 'guided' | 'timed' | 'live';
}

export interface GratitudeEntry {
  userId: string;
  text: string;
  createdAt: Date;
  likes: string[];
  isPublic: boolean;
}

export interface DailyGoal {
  userId: string;
  goalTitle: string;
  description: string;
  targetDays: number;
  selectedDays: string[];
  createdAt: Date;
}

export interface CommunityPost {
  userId: string;
  content: string;
  imageUrl: string;
  createdAt: Date;
  commentsCount: number;
  reactions: {
    like: number;
    love: number;
    insight: number;
  };
}

export interface Notification {
  userId: string;
  message: string;
  read: boolean;
  type: 'meditation' | 'goal' | 'system' | 'social';
  createdAt: Date;
}

export interface Friendship {
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface CheckIn {
  userId: string;
  date: string;
  mood: 'happy' | 'neutral' | 'sad';
  note: string;
  createdAt: Date;
}

export interface Course {
  courseId: string;
  title: string;
  description: string;
  teacherId: string;
  duration: number;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

export interface CourseEnrollment {
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedLessons: string[];
}

export interface MusicTrack {
  trackId: string;
  title: string;
  artistId: string;
  duration: number;
  tags: string[];
  audioUrl: string;
  coverUrl: string;
  createdAt: Date;
}

export interface Playlist {
  userId: string;
  title: string;
  description: string;
  trackIds: string[];
  createdAt: Date;
}

export interface LiveEvent {
  eventId: string;
  title: string;
  hostId: string;
  startTime: Date;
  durationMinutes: number;
  description: string;
  coverImageUrl: string;
}

export interface EventRegistration {
  userId: string;
  eventId: string;
  registeredAt: Date;
}

export interface Teacher {
  teacherId: string;
  name: string;
  bio: string;
  avatarUrl: string;
  specialties: string[];
  rating: number;
} 