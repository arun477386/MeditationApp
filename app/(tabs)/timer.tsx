import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import WheelPicker from 'react-native-wheel-picker-expo';
import { DurationPickerModal } from '../../components/duration-picker/duration-picker-modal';

const { width } = Dimensions.get('window');

export function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isDurationModalVisible, setDurationModalVisible] = React.useState(false);
  const [duration, setDuration] = React.useState({ hours: 0, minutes: 5, seconds: 0 });

  function formatDuration(d: { hours: number; minutes: number; seconds: number }) {
    if (d.hours > 0) return `Meditation ${d.hours}:${d.minutes.toString().padStart(2, '0')}:${d.seconds.toString().padStart(2, '0')}`;
    return `Meditation ${d.minutes}:${d.seconds.toString().padStart(2, '0')}`;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>  
      {/* Tabs */}
      <View style={styles.tabsRow}>
        <View style={styles.tabWithUnderline}>
          <Text style={[styles.tabActive, { color: isDark ? '#fff' : '#222' }]}>Timer</Text>
          <View style={styles.tabUnderline} />
        </View>
        <Text style={styles.tabInactive}>Presets</Text>
        <Feather name="more-horizontal" size={24} color={isDark ? '#fff' : '#222'} style={styles.moreIcon} />
      </View>

      {/* Bell Section */}
      <View style={styles.bellSection}>
        <Text style={styles.bellLabel}>Ending bell</Text>
        <Image
          source={require('../../assets/images/chinese-bell.png')}
          style={styles.bellImage}
          accessibilityLabel="Chinese bell"
        />
        <View style={styles.bellLineRow}>
          <View style={styles.bellLine} />
          <View style={styles.bellNumberCircle}><Text style={styles.bellNumber}>1</Text></View>
          <View style={styles.bellLine} />
        </View>
        <Text style={styles.bellName}>Chinese Bell</Text>
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        <TouchableOpacity
          style={styles.settingsRow}
          accessibilityRole="button"
          onPress={() => setDurationModalVisible(true)}
        >
          <Text style={styles.settingsLabel}>Duration</Text>
          <View style={styles.settingsValueRow}>
            <Text style={styles.settingsValue}>{formatDuration(duration)}</Text>
            <Feather name="chevron-right" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
          <Text style={styles.settingsLabel}>Ambient sounds</Text>
          <View style={styles.settingsValueRow}>
            <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
            <Feather name="chevron-right" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
          <Text style={styles.settingsLabel}>Interval bells</Text>
          <View style={styles.settingsValueRow}>
            <Text style={styles.settingsValue}>None</Text>
            <Feather name="chevron-right" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
          <Text style={styles.settingsLabel}>Starting bell</Text>
          <View style={styles.settingsValueRow}>
            <Text style={styles.settingsValue}>None</Text>
            <Feather name="chevron-right" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Revert Button */}
      <TouchableOpacity style={styles.revertBtn} accessibilityRole="button">
        <Text style={styles.revertText}>Revert to basic Timer &gt;&gt;</Text>
      </TouchableOpacity>

      {/* Play Button and Volume */}
      <View style={styles.bottomRow}>
        <View style={styles.volumeRow}>
          <Feather name="volume-2" size={20} color="#fff" />
          <Text style={styles.volumeText}>66%</Text>
        </View>
        <TouchableOpacity style={styles.playBtn} accessibilityRole="button" accessibilityLabel="Start timer">
          <Feather name="play" size={48} color={isDark ? '#000' : '#fff'} />
        </TouchableOpacity>
        <Feather name="more-horizontal" size={24} color="#fff" style={styles.bottomMoreIcon} />
      </View>

      <DurationPickerModal
        isVisible={isDurationModalVisible}
        onClose={() => setDurationModalVisible(false)}
        onSave={setDuration}
        initialDuration={duration}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#888',
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
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  bellSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  bellLabel: {
    color: '#fff',
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
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  bellNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bellNumber: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  bellName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  settingsList: {
    marginHorizontal: 0,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingsLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  settingsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsValue: {
    color: '#fff',
    fontSize: 18,
    marginRight: 8,
    fontWeight: '400',
    opacity: 0.7,
  },
  newBadge: {
    backgroundColor: '#FFA726',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  revertBtn: {
    alignItems: 'center',
    marginVertical: 24,
  },
  revertText: {
    color: '#888',
    fontSize: 20,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 32,
  },
  volumeText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 4,
    fontWeight: '500',
  },
  playBtn: {
    backgroundColor: '#fff',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginRight: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomMoreIcon: {
    marginLeft: 32,
  },
});

export default TimerScreen; 