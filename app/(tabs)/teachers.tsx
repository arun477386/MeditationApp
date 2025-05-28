import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { typography, elementSizes } from '../theme/sizes';
import { Image } from '@/components/ui/Image';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type RootDrawerParamList = {
  '(tabs)': undefined;
  '+not-found': undefined;
};

type TeachersScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, '(tabs)'>;

interface TeacherProfileProps {
  imageUrl: string;
  name: string;
  theme: typeof Colors.light;
}

const TeacherProfile: React.FC<TeacherProfileProps> = ({ imageUrl, name, theme }) => {
  const { width } = useWindowDimensions();
  const GRID_SPACING = 12;
  const ITEMS_PER_ROW = 4;
  const HORIZONTAL_PADDING = 20;
  const availableWidth = width - (HORIZONTAL_PADDING * 2);
  const itemWidth = (availableWidth - (GRID_SPACING * (ITEMS_PER_ROW - 1))) / ITEMS_PER_ROW;

  return (
    <View style={[styles.profileContainer, { width: itemWidth }]}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.profileImage, { width: itemWidth, height: itemWidth }]}
        contentFit="cover"
        fallbackSource={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
      />
      <Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>{name}</Text>
    </View>
  );
};

// Sample teacher data
const TEACHERS = [
  { id: 1, name: 'Sarah Wilson', imageUrl: 'https://picsum.photos/200' },
  { id: 2, name: 'Michael Chen', imageUrl: 'https://picsum.photos/201' },
  { id: 3, name: 'Emma Davis', imageUrl: 'https://picsum.photos/202' },
  { id: 4, name: 'James Taylor', imageUrl: 'https://picsum.photos/203' },
  { id: 5, name: 'Sophia Lee', imageUrl: 'https://picsum.photos/204' },
  { id: 6, name: 'David Kim', imageUrl: 'https://picsum.photos/205' },
  // Add more teachers as needed
];

interface OptionItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  count?: string | number;
  onPress: () => void;
  theme: typeof Colors.light;
}

const OptionItem: React.FC<OptionItemProps> = ({ icon, label, count, onPress, theme }) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <View style={styles.optionContent}>
      <Feather name={icon} size={24} color={theme.icon} style={styles.optionIcon} />
      <Text style={[styles.optionLabel, { color: theme.text }]}>{label}</Text>
    </View>
    <View style={styles.optionRight}>
      {count !== undefined && (
        <Text style={[styles.optionCount, { color: theme.textSecondary }]}>{count}</Text>
      )}
      <Feather name="chevron-right" size={24} color={theme.textSecondary} />
    </View>
  </TouchableOpacity>
);

export default function TeachersScreen() {
  const navigation = useNavigation<TeachersScreenNavigationProp>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleDrawerOpen = () => {
    navigation.openDrawer();
  };

  const handleOptionPress = (option: string) => {
    // Handle navigation or action for each option
    console.log(`${option} pressed`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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

      {/* <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Teachers</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{TEACHERS.length.toLocaleString()} of the world's best teachers.</Text>
        </View>

        <View style={styles.profileGrid}>
          {TEACHERS.map((teacher) => (
            <TeacherProfile
              key={teacher.id}
              imageUrl={teacher.imageUrl}
              name={teacher.name}
              theme={theme}
            />
          ))}
        </View>

        <View style={styles.optionsContainer}>
          <OptionItem
            icon="book"
            label="My Teachers"
            onPress={() => handleOptionPress('My Teachers')}
            theme={theme}
          />
          <OptionItem
            icon="video"
            label="Live events"
            count="1,349"
            onPress={() => handleOptionPress('Live events')}
            theme={theme}
          />
          <OptionItem
            icon="home"
            label="Retreats"
            count="305"
            onPress={() => handleOptionPress('Retreats')}
            theme={theme}
          />
          <OptionItem
            icon="award"
            label="Challenges"
            count="Coming soon"
            onPress={() => handleOptionPress('Challenges')}
            theme={theme}
          />
        </View>
      </ScrollView> */}
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
    height: elementSizes.topBarHeight,
  },
  iconButton: {
    width: elementSizes.iconButton,
    height: elementSizes.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.bodyLarge,
    opacity: 0.8,
    textAlign: 'center',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: 'flex-start',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    borderRadius: 999,
    marginBottom: 6,
  },
  profileName: {
    fontSize: typography.bodySmall,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionLabel: {
    fontSize: typography.bodyLarge,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionCount: {
    fontSize: typography.bodyMedium,
  },
}); 