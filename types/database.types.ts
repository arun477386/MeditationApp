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
  meditationStreak: number;
  totalSessions: number;
  totalMinutes: number;
  app: string; // Reference to MeditationApp document
  role: 'user' | 'admin'; // User role for access control
}

export interface MeditationSession {
  sessionId: string;
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
  entryId: string;
  userId: string;
  text: string;
  createdAt: Date;
  likes: string[];
  isPublic: boolean;
}

export interface DailyGoal {
  goalId: string;
  userId: string;
  goalTitle: string;
  description: string;
  targetDays: number;
  selectedDays: string[];
  createdAt: Date;
}

export interface CommunityPost {
  postId: string;
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
  notificationId: string;
  userId: string;
  message: string;
  read: boolean;
  type: 'meditation' | 'goal' | 'system' | 'social';
  createdAt: Date;
}

export interface Friendship {
  friendshipId: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface CheckIn {
  checkInId: string;
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
  updatedAt: Date;
  totalEnrollments: number;
  averageRating: number;
  totalRatings: number;
  isPublished: boolean;
  price: number;
  currency: string;
  thumbnailUrl: string;
  videoUrl: string;
  prerequisites: string[];
  learningObjectives: string[];
}

export interface CourseEnrollment {
  enrollmentId: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedLessons: string[];
  progress: number;
  lastAccessedAt: Date;
  status: 'active' | 'completed' | 'dropped';
}

export interface CourseRating {
  ratingId: string;
  courseId: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
  helpfulVotes: number;
  isVerifiedEnrollment: boolean;
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
  playlistId: string;
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
  registrationId: string;
  userId: string;
  eventId: string;
  registeredAt: Date;
}

export interface Teacher {
  teacherId: string;
  name: string;
  bio: string;
  avatarUrl: string;
  location: string;
  specialties: string[];
  rating: number;
  totalCourses: number;
  totalStudents: number;
  courses: string[]; // Array of courseIds
  followers: string[]; // Array of userIds
  createdAt: Date;
  updatedAt: Date;
  socialLinks: {
    website?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  certifications: string[];
  languages: string[];
  availability: {
    isAvailable: boolean;
    nextAvailableDate?: Date;
  };
  events: TeacherEvent[];
  challenges: TeacherChallenge[];
  updates: TeacherUpdate[];
}

export interface TeacherEvent {
  eventId: string;
  title: string;
  description: string;
  date: Date;
  duration: string;
  type: 'live' | 'workshop' | 'retreat';
  isPlus: boolean;
  maxParticipants?: number;
  currentParticipants: number;
  price?: number;
  location?: string;
  onlineLink?: string;
}

export interface TeacherChallenge {
  challengeId: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  isPlus: boolean;
  joinedCount: number;
  imageUrl: string;
  requirements: string[];
  rewards: string[];
}

export interface TeacherUpdate {
  updateId: string;
  type: 'track' | 'course' | 'event' | 'challenge';
  contentId: string;
  title: string;
  description: string;
  createdAt: Date;
  isPlus: boolean;
}

export interface TeacherRating {
  ratingId: string;
  teacherId: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
  helpfulVotes: number;
  isVerifiedStudent: boolean;
}

export interface MeditationApp {
  courses: Record<string, Course>;
  musicTracks: Record<string, MusicTrack>;
  liveEvents: Record<string, LiveEvent>;
  teachers: Record<string, Teacher>;
  checkIns: Record<string, CheckIn>;
  meditationSessions: Record<string, MeditationSession>;
  gratitudeEntries: Record<string, GratitudeEntry>;
  dailyGoals: Record<string, DailyGoal>;
  communityPosts: Record<string, CommunityPost>;
  notifications: Record<string, Notification>;
  friendships: Record<string, Friendship>;
  courseEnrollments: Record<string, CourseEnrollment>;
  courseRatings: Record<string, CourseRating>;
  playlists: Record<string, Playlist>;
  eventRegistrations: Record<string, EventRegistration>;
  teacherRatings: Record<string, TeacherRating>;
} 