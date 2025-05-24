import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import WheelPicker from 'react-native-wheel-picker-expo';
import { DurationPickerModal } from '../../components/duration-picker/duration-picker-modal';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export function TimerScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isDurationModalVisible, setDurationModalVisible] = React.useState(false);
  const [duration, setDuration] = React.useState({ hours: 0, minutes: 5, seconds: 0 });

  function formatDuration(d: { hours: number; minutes: number; seconds: number }) {
    if (d.hours > 0) return `Meditation ${d.hours}:${d.minutes.toString().padStart(2, '0')}:${d.seconds.toString().padStart(2, '0')}`;
    return `Meditation ${d.minutes}:${d.seconds.toString().padStart(2, '0')}`;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>  
      <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Tabs */}
        <View style={styles.tabsRow}>
          <View style={styles.tabWithUnderline}>
            <Text style={[styles.tabActive, { color: theme.text }]} >Timer</Text>
            <View style={[styles.tabUnderline, { backgroundColor: theme.text }]} />
          </View>
          <Text style={[styles.tabInactive, { color: theme.textSecondary }]}>Presets</Text>
        </View>

        {/* Bell Section */}
        <View style={styles.bellSection}>
          <Text style={[styles.bellLabel, { color: theme.text }]}>Ending bell</Text>
          <Image
            source={require('../../assets/images/chinese-bell.png')}
            style={styles.bellImage}
            accessibilityLabel="Chinese bell"
          />
          <View style={styles.bellLineRow}>
            <View style={[styles.bellLine, { backgroundColor: theme.text }]} />
            <View style={[styles.bellNumberCircle, { backgroundColor: theme.card }]}> 
              <Text style={[styles.bellNumber, { color: theme.text }]} >1</Text>
            </View>
            <View style={[styles.bellLine, { backgroundColor: theme.text }]} />
          </View>
          <Text style={[styles.bellName, { color: theme.textSecondary }]}>Chinese Bell</Text>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={styles.settingsRow}
            accessibilityRole="button"
            onPress={() => setDurationModalVisible(true)}
          >
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Duration</Text>
            <View style={styles.settingsValueRow}>
              <Text style={[styles.settingsValue, { color: theme.textSecondary }]}>{formatDuration(duration)}</Text>
              <Feather name="chevron-right" size={22} color={theme.icon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Ambient sounds</Text>
            <View style={styles.settingsValueRow}>
              <View style={[styles.newBadge, { backgroundColor: theme.plus }]}> <Text style={[styles.newBadgeText, { color: theme.background }]}>NEW</Text></View>
              <Feather name="chevron-right" size={22} color={theme.icon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Interval bells</Text>
            <View style={styles.settingsValueRow}>
              <Text style={[styles.settingsValue, { color: theme.textSecondary }]}>None</Text>
              <Feather name="chevron-right" size={22} color={theme.icon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Starting bell</Text>
            <View style={styles.settingsValueRow}>
              <Text style={[styles.settingsValue, { color: theme.textSecondary }]}>None</Text>
              <Feather name="chevron-right" size={22} color={theme.icon} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Revert Button */}
        <TouchableOpacity style={styles.revertBtn} accessibilityRole="button">
          <Text style={[styles.revertText, { color: theme.accent }]}>Revert to basic Timer &gt;&gt;</Text>
        </TouchableOpacity>

        {/* Play Button and Volume */}
        <View style={styles.bottomRow}>
          <View style={styles.volumeRow}>
            <Feather name="volume-2" size={20} color={theme.icon} />
            <Text style={[styles.volumeText, { color: theme.textSecondary }]}>66%</Text>
          </View>
          <TouchableOpacity style={[styles.playBtn, { backgroundColor: theme.accent }]} accessibilityRole="button" accessibilityLabel="Start timer">
            <Feather name="play" size={48} color={theme.background} />
          </TouchableOpacity>
          <Feather name="more-horizontal" size={24} color={theme.icon} style={styles.bottomMoreIcon} />
        </View>

        <DurationPickerModal
          isVisible={isDurationModalVisible}
          onClose={() => setDurationModalVisible(false)}
          onSave={setDuration}
          initialDuration={duration}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'flex-start',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 22,
    paddingHorizontal: 24,
    marginBottom: 0,
    position: 'relative',
  },
  tabWithUnderline: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  tabActive: {
    fontSize: 22,
    fontWeight: '700',
  },
  tabInactive: {
    fontSize: 22,
    fontWeight: '700',
    opacity: 0.5,
  },
  moreIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  bellSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  bellLabel: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  bellImage: {
    width: width * 0.45,
    height: width * 0.23,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  bellLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  bellLine: {
    height: 2,
    width: 48,
    opacity: 0.3,
  },
  bellNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
  },
  bellNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  bellName: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  settingsList: {
    marginTop: 12,
    marginBottom: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  settingsLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  settingsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 16,
    marginRight: 8,
  },
  newBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  revertBtn: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  revertText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomMoreIcon: {
    alignSelf: 'center',
    marginLeft: 24,
    marginRight: 4,
  },
});

export default TimerScreen; 