import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { typography } from './theme/sizes';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type RootDrawerParamList = {
  '(tabs)': undefined;
  '+not-found': undefined;
};

type SavedScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, '(tabs)'>;

interface GridItemProps {
  index: number;
  theme: typeof Colors.light;
}

const GridItem: React.FC<GridItemProps> = ({ index, theme }) => {
  // Calculate border radius based on position
  const style = {
    ...styles.thumbnailContent,
    borderTopLeftRadius: index === 0 ? 8 : 0,
    borderTopRightRadius: index === 1 ? 8 : 0,
    borderBottomLeftRadius: index === 2 ? 8 : 0,
    borderBottomRightRadius: index === 3 ? 8 : 0,
    backgroundColor: theme.card,
  };

  return (
    <View style={styles.gridItem}>
      <View style={style} />
    </View>
  );
};

interface WindowSectionProps {
  title: string;
  theme: typeof Colors.light;
}

const WindowSection: React.FC<WindowSectionProps> = ({ title, theme }) => (
  <View style={styles.windowSection}>
    <TouchableOpacity>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((index) => (
          <GridItem key={index} index={index} theme={theme} />
        ))}
      </View>
      <Text style={[styles.windowTitle, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  </View>
);

export default function SavedScreen() {
  const navigation = useNavigation<SavedScreenNavigationProp>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleDrawerOpen = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      {/* <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleDrawerOpen}
        >
          <Feather name="menu" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationCount}>1</Text>
          <Feather name="droplet" size={24} color="#FFFFFF" />
        </View>
      </View> */}

      <ScrollView style={styles.scrollView}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Saved</Text>

        {/* Windows Section */}
        <View style={styles.windowsContainer}>
          <WindowSection title="Recently Played" theme={theme} />
          <WindowSection title="Listen Later" theme={theme} />
        </View>

        {/* Folders Section */}
        <View style={styles.section}>
          <View style={styles.folderHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Folders</Text>
            <TouchableOpacity>
              <Text style={[styles.editButton, { color: theme.accent }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Folder Items */}
          <TouchableOpacity style={styles.folderItem}>
            <Feather name="bookmark" size={24} color={theme.icon} />
            <Text style={[styles.folderName, { color: theme.text }]}>Bookmarks</Text>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="music" size={24} color={theme.icon} />
            <Text style={[styles.folderName, { color: theme.text }]}>Playlists</Text>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="book" size={24} color={theme.icon} />
            <Text style={[styles.folderName, { color: theme.text }]}>Journal</Text>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="award" size={24} color={theme.icon} />
            <Text style={[styles.folderName, { color: theme.text }]}>Challenges</Text>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="book-open" size={24} color={theme.icon} />
            <Text style={[styles.folderName, { color: theme.text }]}>Courses</Text>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="download-cloud" size={24} color={theme.icon} />
            <Text style={[styles.folderName, { color: theme.text }]}>Downloads</Text>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="folder" size={24} color={theme.icon} />
            <Text style={[styles.folderName, { color: theme.text }]}>Create a folder</Text>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.folderItem}
            onPress={() => router.push('/goto')}
          >
            <Feather name="navigation" size={24} color={theme.icon} />
            <Text style={[styles.folderName, { color: theme.text }]}>GoTo</Text>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
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
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 5,
  },
  scrollView: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 32,
  },
  windowsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  windowSection: {
    flex: 1,
    marginHorizontal: 6,
  },
  windowTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -1,
  },
  gridItem: {
    width: '50%',
    aspectRatio: 1,
    padding: 1,
  },
  thumbnailContent: {
    flex: 1,
    backgroundColor: '#2A2A2A',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    color: '#2D9B83',
    fontSize: 16,
    fontWeight: '500',
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  folderName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 16,
  },
}); 