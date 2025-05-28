import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { typography } from '../theme/sizes';
import { CourseCard } from '../components/CourseCard';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
  theme: typeof Colors.light;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ icon, label, count, onPress, theme }) => (
  <TouchableOpacity style={[styles.categoryItem]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
    <View style={[styles.iconContainer, { backgroundColor: theme.card }]}> 
      {icon}
      {count !== undefined && (
        <View style={[styles.countBadge, { backgroundColor: theme.plus }]}> 
          <Text style={[styles.countText, { color: theme.text }]}>{count}</Text>
        </View>
      )}
    </View>
    <Text style={[styles.categoryLabel, { color: theme.text }]}>{label}</Text>
  </TouchableOpacity>
);

const TOPICS = [
  'Mornings', 'Events', 'Yoga Nidra', 'Anxiety', 'Meditation',
  'Self-Love', 'Chakras', 'Buddhism', '+21k'
];

export default function LibraryScreen() {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleDrawerOpen = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.background }]}> 
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleDrawerOpen}
        >
          <Feather name="menu" size={22} color={theme.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.categoriesGrid}>
          <CategoryItem
            icon={<Ionicons name="headset-outline" size={28} color={theme.icon} />}
            label="Meditate"
            onPress={() => router.push('/meditation' as any)}
            theme={theme}
          />
          <CategoryItem
            icon={<Ionicons name="moon-outline" size={28} color={theme.icon} />}
            label="Events"
            onPress={() => router.push('/events' as any)}
            theme={theme}
          />
          {/* <CategoryItem
            icon={<Ionicons name="sunny-outline" size={28} color={theme.icon} />}
            label="Mornings"
            theme={theme}
          />
          <CategoryItem
            icon={<Ionicons name="leaf-outline" size={28} color={theme.icon} />}
            label="Breathe"
            theme={theme}
          />
          <CategoryItem
            icon={<Ionicons name="leaf-outline" size={28} color={theme.icon} />}
            label="Beginners"
            theme={theme}
          />
          <CategoryItem
            icon={<Ionicons name="musical-notes-outline" size={28} color={theme.icon} />}
            label="Music"
            theme={theme}
          /> */}
          <CategoryItem
            icon={<Ionicons name="school-outline" size={28} color={theme.icon} />}
            label="Courses"
            count={9}
            theme={theme}
          />
          {/* <CategoryItem
            icon={<Ionicons name="trophy-outline" size={28} color={theme.icon} />}
            label="Challenges"
            theme={theme}
          /> */}
        </View>





        {/* <View style={styles.coursesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Courses for you</Text>
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
        </View> */}

        {/* Topics Section */}
        {/* <View style={styles.topicsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Topics</Text>
          <View style={styles.topicsGrid}>
            {TOPICS.map((topic, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.topicPill, { borderColor: theme.accent }]}
              >
                <Text style={[styles.topicText, { color: theme.accent }]}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}



        

        {/* Get Started Section */}
        {/* <View style={styles.getStartedSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Get started</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>A personalized selection to get you started.</Text>
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
        </View> */}




        {/* 3 Mins For You Section */}
        {/* <View style={styles.shortMeditationsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>3 mins for you</Text>
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
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  link: {
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
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
  },
  coursesSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
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
    margin: 5,
  },
  topicText: {
    fontSize: typography.bodySmall,
    fontWeight: '500',
  },
  getStartedSection: {
    marginTop: 48,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: typography.bodyMedium,
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