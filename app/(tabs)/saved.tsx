import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { typography } from '../theme/sizes';

type RootDrawerParamList = {
  '(tabs)': undefined;
  '+not-found': undefined;
};

type SavedScreenNavigationProp = DrawerNavigationProp<RootDrawerParamList, '(tabs)'>;

interface GridItemProps {
  index: number;
}

const GridItem: React.FC<GridItemProps> = ({ index }) => {
  // Calculate border radius based on position
  const style = {
    ...styles.thumbnailContent,
    borderTopLeftRadius: index === 0 ? 8 : 0,
    borderTopRightRadius: index === 1 ? 8 : 0,
    borderBottomLeftRadius: index === 2 ? 8 : 0,
    borderBottomRightRadius: index === 3 ? 8 : 0,
  };

  return (
    <View style={styles.gridItem}>
      <View style={style} />
    </View>
  );
};

interface WindowSectionProps {
  title: string;
}

const WindowSection: React.FC<WindowSectionProps> = ({ title }) => (
  <View style={styles.windowSection}>
    <TouchableOpacity>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((index) => (
          <GridItem key={index} index={index} />
        ))}
      </View>
      <Text style={styles.windowTitle}>{title}</Text>
    </TouchableOpacity>
  </View>
);

export default function SavedScreen() {
  const navigation = useNavigation<SavedScreenNavigationProp>();

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
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationCount}>1</Text>
          <Feather name="droplet" size={24} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.screenTitle}>Saved</Text>

        {/* Windows Section */}
        <View style={styles.windowsContainer}>
          <WindowSection title="Recently Played" />
          <WindowSection title="Listen Later" />
        </View>

        {/* Folders Section */}
        <View style={styles.section}>
          <View style={styles.folderHeader}>
            <Text style={styles.sectionTitle}>Folders</Text>
            <TouchableOpacity>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Folder Items */}
          <TouchableOpacity style={styles.folderItem}>
            <Feather name="bookmark" size={24} color="#FFFFFF" />
            <Text style={styles.folderName}>Bookmarks</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="music" size={24} color="#FFFFFF" />
            <Text style={styles.folderName}>Playlists</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="book" size={24} color="#FFFFFF" />
            <Text style={styles.folderName}>Journal</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="award" size={24} color="#FFFFFF" />
            <Text style={styles.folderName}>Challenges</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="book-open" size={24} color="#FFFFFF" />
            <Text style={styles.folderName}>Courses</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="download-cloud" size={24} color="#FFFFFF" />
            <Text style={styles.folderName}>Downloads</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.folderItem}>
            <Feather name="folder" size={24} color="#FFFFFF" />
            <Text style={styles.folderName}>Create a folder</Text>
            <Feather name="chevron-right" size={24} color="#666666" />
          </TouchableOpacity>
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