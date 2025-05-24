import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { typography } from '../theme/sizes';
import { CourseCard } from '../components/CourseCard';
import { useRouter } from 'expo-router';

type RootDrawerParamList = {
  '(tabs)': undefined;
  '+not-found': undefined;
};

type LibraryScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, '(tabs)'>;

interface CategoryItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onPress?: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ icon, label, count, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
    <View style={styles.iconContainer}>
      {icon}
      {count !== undefined && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </View>
    <Text style={styles.categoryLabel}>{label}</Text>
  </TouchableOpacity>
);

const TOPICS = [
  'Mornings', 'Events', 'Yoga Nidra', 'Anxiety', 'Meditation',
  'Self-Love', 'Chakras', 'Buddhism', '+21k'
];

export default function LibraryScreen() {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const router = useRouter();

  const handleDrawerOpen = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleDrawerOpen}
        >
          <Feather name="menu" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.categoriesGrid}>
          <CategoryItem
            icon={<Ionicons name="headset-outline" size={28} color="#FFFFFF" />}
            label="Meditate"
            onPress={() => router.push('/meditation' as any)}
          />
          <CategoryItem
            icon={<Ionicons name="moon-outline" size={28} color="#FFFFFF" />}
            label="Events"
            onPress={() => router.push('/events' as any)}
          />
          <CategoryItem
            icon={<Ionicons name="sunny-outline" size={28} color="#FFFFFF" />}
            label="Mornings"
          />
          <CategoryItem
            icon={<Ionicons name="leaf-outline" size={28} color="#FFFFFF" />}
            label="Breathe"
          />
          <CategoryItem
            icon={<Ionicons name="leaf-outline" size={28} color="#FFFFFF" />}
            label="Beginners"
          />
          <CategoryItem
            icon={<Ionicons name="musical-notes-outline" size={28} color="#FFFFFF" />}
            label="Music"
          />
          <CategoryItem
            icon={<Ionicons name="school-outline" size={28} color="#FFFFFF" />}
            label="Courses"
            count={9}
          />
          <CategoryItem
            icon={<Ionicons name="trophy-outline" size={28} color="#FFFFFF" />}
            label="Challenges"
          />
        </View>

        <View style={styles.coursesSection}>
          <Text style={styles.sectionTitle}>Courses for you</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.coursesScroll}
          >
            <CourseCard
              rating={4.8}
              duration={7}
              isPlus={true}
              title="Healing After Heartbreak"
              instructor="Fabienne Sandoval"
            />
            <CourseCard
              rating={4.9}
              duration={10}
              title="Journey to Inner Peace"
              instructor="Olivia Johnson"
            />
          </ScrollView>
        </View>

        {/* Topics Section */}
        <View style={styles.topicsSection}>
          <Text style={styles.sectionTitle}>Topics</Text>
          <View style={styles.topicsGrid}>
            {TOPICS.map((topic, index) => (
              <TouchableOpacity
                key={index}
                style={styles.topicPill}
              >
                <Text style={styles.topicText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Get Started Section */}
        <View style={styles.getStartedSection}>
          <Text style={styles.sectionTitle}>Get started</Text>
          <Text style={styles.sectionSubtitle}>A personalized selection to get you started.</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.getStartedScroll}
          >
            <CourseCard
              title="Learn How To Meditate..."
              type="Challenge"
              duration={7}
              instructor="Sarah Johnson"
              imageUrl="https://example.com/meditation-basics.jpg"
            />
            <CourseCard
              title="Meditation To Overcom..."
              type="Course"
              duration={10}
              isPlus={true}
              instructor="Michael Chen"
              imageUrl="https://example.com/meditation-advanced.jpg"
            />
          </ScrollView>
        </View>

        {/* 3 Mins For You Section */}
        <View style={styles.shortMeditationsSection}>
          <Text style={styles.sectionTitle}>3 mins for you</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shortMeditationsScroll}
          >
            <CourseCard
              title="Quick Morning Meditation"
              instructor="Emma Wilson"
              duration={3}
            />
            <CourseCard
              title="Stress Relief in 3 Minutes"
              instructor="David Lee"
              duration={3}
            />
          </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  link: {
    color: '#2D9B83',
    fontSize: 14,
    marginTop: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#2A2A2A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F4A62A',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  coursesSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  coursesScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  topicsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginHorizontal: -6,
  },
  topicPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00BFA5',
    margin: 5,
  },
  topicText: {
    color: '#00BFA5',
    fontSize: typography.bodySmall,
    fontWeight: '500',
  },
  getStartedSection: {
    marginTop: 48,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: typography.bodyMedium,
    color: '#AAAAAA',
    marginTop: 4,
  },
  getStartedScroll: {
    paddingTop: 24,
    paddingRight: 20,
  },
  shortMeditationsSection: {
    marginTop: 48,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  shortMeditationsScroll: {
    paddingTop: 24,
    paddingRight: 20,
  },
}); 