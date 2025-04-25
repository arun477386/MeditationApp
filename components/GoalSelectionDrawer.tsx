import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  StyleSheet, 
  StatusBar,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface GoalSelectionDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDays: (days: number) => void;
  selectedDays: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export function GoalSelectionDrawer({ 
  isVisible, 
  onClose, 
  onSelectDays,
  selectedDays 
}: GoalSelectionDrawerProps) {
  const insets = useSafeAreaInsets();
  const [translateX] = React.useState(new Animated.Value(SCREEN_WIDTH));
  const [isHidden, setIsHidden] = React.useState(!isVisible);

  React.useEffect(() => {
    if (isVisible) {
      setIsHidden(false);
    }
    
    Animated.timing(translateX, {
      toValue: isVisible ? 0 : SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!isVisible) {
        setIsHidden(true);
      }
    });
  }, [isVisible]);

  if (isHidden) {
    return null;
  }

  const dayOptions = [3, 5, 7, 10, 14, 21];

  return (
    <View style={[styles.container, { height: SCREEN_HEIGHT }]}>
      <StatusBar barStyle="light-content" />
      <Animated.View 
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            height: SCREEN_HEIGHT
          }
        ]}
      >
        <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
          <View style={styles.topSection}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="chevron-left" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>My goal</Text>
              <Text style={styles.description}>
                Select a goal to measure your progress and form healthy habits.
              </Text>
            </View>
          </View>

          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {dayOptions.map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.optionContainer,
                  selectedDays === days && styles.selectedOption,
                ]}
                onPress={() => onSelectDays(days)}
              >
                <Text style={[
                  styles.optionText,
                  selectedDays === days && styles.selectedOptionText
                ]}>
                  {days} consecutive days
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity
              style={[
                styles.button,
                selectedDays > 0 && styles.buttonActive
              ]}
              onPress={onClose}
            >
              <Text style={[
                styles.buttonText,
                selectedDays > 0 && styles.buttonTextActive
              ]}>
                Save changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    backgroundColor: '#121212',
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -8,
    marginBottom: 8,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  optionsContainer: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  selectedOption: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  selectedOptionText: {
    color: '#000000',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckIcon: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonActive: {
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
}); 