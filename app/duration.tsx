import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import { MeditationTypeBottomSheet } from '../components/meditation-type-bottom-sheet';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTimerSettings } from '@/components/providers/TimerSettingsProvider';

const { width } = Dimensions.get('window');

const WARMUP_OPTIONS = [0, 5, 10, 15, 60, 120, 300, 600, 3600]; // 0s, 5s, 10s, 15s, 1m, 2m, 5m, 10m, 1h
const WARMUP_LABELS = ['0s', '5s', '10s', '15s', '1m', '2m', '5m', '10m', '1h'];
const MEDITATION_TYPES = [
  'Meditation',
  'Yoga',
  'Tai Chi',
  'Walking',
  'Breathing',
  'Chanting',
  'Prayer',
  'Healing',
  'Massage',
  'Manifesting',
  'Nap',
];

export default function DurationScreen() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [selectedWarmup, setSelectedWarmup] = useState(0);
  const { setDuration: setGlobalDuration, setMeditationType: setGlobalMeditationType, isInfinity, setIsInfinity } = useTimerSettings();
  const [meditationType, setMeditationType] = useState('Meditation');
  const router = useRouter();
  const [showTypeSheet, setShowTypeSheet] = useState(false);

  // Picker data
  const hoursData = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutesData = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const secondsData = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  function handleCancel() {
    router.back();
  }

  function handleSave() {
    if (isInfinity) {
      setGlobalDuration({ hours: 0, minutes: 0, seconds: 0 });
    } else {
      setGlobalDuration({ hours, minutes, seconds });
    }
    setGlobalMeditationType(meditationType);
    router.back();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} accessibilityRole="button">
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Duration</Text>
        <TouchableOpacity onPress={handleSave} accessibilityRole="button">
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Infinity Icon Toggle */}
      <View style={styles.infinityRow}>
        <TouchableOpacity
          style={styles.infinityBtn}
          onPress={() => setIsInfinity((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Toggle infinite duration"
        >
          <MaterialCommunityIcons name="infinity" size={36} color="#fff" style={{ opacity: 0.9 }} />
        </TouchableOpacity>
      </View>

      {/* Time Picker or Infinity Icon */}
      <View style={styles.pickerContainer}>
        {isInfinity ? (
          <View style={styles.infinityIconContainer}>
            <MaterialCommunityIcons name="infinity" size={96} color="#fff" style={{ opacity: 0.9 }} />
          </View>
        ) : (
          <View style={styles.pickerRow}>
            {/* Hours */}
            <View style={styles.pickerCol}>
              <ScrollPicker
                dataSource={hoursData}
                selectedIndex={hours}
                renderItem={(data, index, isSelected) => (
                  <View style={isSelected ? styles.slotSelected : styles.slotUnselected}>
                    <Text style={isSelected ? styles.slotSelectedText : styles.slotUnselectedText}>{data}</Text>
                  </View>
                )}
                onValueChange={(_, selectedIndex) => setHours(selectedIndex)}
                wrapperHeight={180}
                wrapperBackground="#00000000"
                itemHeight={40}
                highlightColor="#00000000"
                highlightBorderWidth={0}
              />
              <Text style={styles.unit}>h</Text>
            </View>
            {/* Minutes */}
            <View style={styles.pickerCol}>
              <ScrollPicker
                dataSource={minutesData}
                selectedIndex={minutes}
                renderItem={(data, index, isSelected) => (
                  <View style={isSelected ? styles.slotSelected : styles.slotUnselected}>
                    <Text style={isSelected ? styles.slotSelectedText : styles.slotUnselectedText}>{data}</Text>
                  </View>
                )}
                onValueChange={(_, selectedIndex) => setMinutes(selectedIndex)}
                wrapperHeight={180}
                wrapperBackground="#00000000"
                itemHeight={40}
                highlightColor="#00000000"
                highlightBorderWidth={0}
              />
              <Text style={styles.unit}>m</Text>
            </View>
            {/* Seconds */}
            <View style={styles.pickerCol}>
              <ScrollPicker
                dataSource={secondsData}
                selectedIndex={seconds}
                renderItem={(data, index, isSelected) => (
                  <View style={isSelected ? styles.slotSelected : styles.slotUnselected}>
                    <Text style={isSelected ? styles.slotSelectedText : styles.slotUnselectedText}>{data}</Text>
                  </View>
                )}
                onValueChange={(_, selectedIndex) => setSeconds(selectedIndex)}
                wrapperHeight={180}
                wrapperBackground="#00000000"
                itemHeight={40}
                highlightColor="#00000000"
                highlightBorderWidth={0}
              />
              <Text style={styles.unit}>s</Text>
            </View>
          </View>
        )}
      </View>

      {/* Meditation Type */}
      <View style={styles.meditationRow}>
        <TouchableOpacity
          style={styles.meditationTypeBtn}
          onPress={() => setShowTypeSheet(true)}
          accessibilityRole="button"
        >
          <Text style={styles.meditationText}>{meditationType}</Text>
          <Ionicons name="chevron-down" size={24} color="#fff" style={{ marginLeft: 4, marginTop: 2 }} />
        </TouchableOpacity>
      </View>

      {/* Warm Up */}
      <View style={styles.warmupRow}>
        <Text style={styles.warmupLabel}>Warm Up</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.warmupScrollContent}>
          {WARMUP_OPTIONS.map((sec, idx) => (
            <TouchableOpacity
              key={sec}
              onPress={() => setSelectedWarmup(sec)}
              style={[styles.warmupOption, sec === selectedWarmup && styles.warmupSelected]}
            >
              <Text style={[styles.warmupOptionText, sec === selectedWarmup && styles.warmupSelectedText]}>
                {WARMUP_LABELS[idx]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Meditation Type Bottom Sheet */}
      <MeditationTypeBottomSheet
        visible={showTypeSheet}
        onClose={() => setShowTypeSheet(false)}
        onSelect={setMeditationType}
        selectedType={meditationType}
      />
    </View>
  );
}

const SELECTED_BG = 'rgba(40,40,40,0.8)';
const SELECTED_TEXT = '#fff';
const UNSELECTED_TEXT = '#888';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  cancel: { color: '#F44', fontSize: 18, fontWeight: '500' },
  save: { color: '#F44', fontSize: 18, fontWeight: '500' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  infinityRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 0,
  },
  infinityBtn: {
    alignSelf: 'flex-end',
    marginBottom: 0,
    marginTop: -8,
  },
  pickerContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infinityIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 200,
  },
  pickerCol: {
    alignItems: 'center',
    marginHorizontal: 12,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 8,
    width: 80,
  },
  slotSelected: {
    backgroundColor: SELECTED_BG,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  slotUnselected: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  slotSelectedText: {
    color: SELECTED_TEXT,
    fontSize: 24,
    fontWeight: '600',
  },
  slotUnselectedText: {
    color: UNSELECTED_TEXT,
    fontSize: 24,
    fontWeight: '400',
  },
  unit: {
    color: '#fff',
    fontSize: 18,
    marginTop: 2,
    fontWeight: '400',
  },
  meditationRow: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  meditationTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meditationText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  warmupRow: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  warmupLabel: {
    color: '#888',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    alignSelf: 'center',
  },
  warmupScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  warmupOption: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  warmupSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  warmupOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  warmupSelectedText: {
    color: '#000',
    fontWeight: '700',
  },
}); 