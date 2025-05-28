import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ScrollPicker from 'react-native-wheel-scrollview-picker';

export interface DurationPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (duration: { hours: number; minutes: number; seconds: number }) => void;
  initialDuration?: { hours: number; minutes: number; seconds: number };
}

const SELECTED_BG = 'rgba(40,40,40,0.8)';
const SELECTED_TEXT = '#fff';
const UNSELECTED_TEXT = '#888';

// Type for picker data
interface PickerData {
  value: string;
  label: string;
}

export function DurationPickerModal({
  isVisible,
  onClose,
  onSave,
  initialDuration = { hours: 0, minutes: 5, seconds: 0 },
}: DurationPickerModalProps) {
  const [hours, setHours] = React.useState(initialDuration.hours);
  const [minutes, setMinutes] = React.useState(initialDuration.minutes);
  const [seconds, setSeconds] = React.useState(initialDuration.seconds);
  const [hasChanged, setHasChanged] = React.useState(false);
  const [selectedWarmup, setSelectedWarmup] = React.useState(0);
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  React.useEffect(() => {
    setHours(initialDuration.hours);
    setMinutes(initialDuration.minutes);
    setSeconds(initialDuration.seconds);
    setHasChanged(false);
  }, [isVisible, initialDuration]);

  function handleSave() {
    onSave({ hours, minutes, seconds });
    onClose();
  }

  function handleTimeChange(type: 'h' | 'm' | 's', value: number) {
    if (type === 'h') setHours(value);
    if (type === 'm') setMinutes(value);
    if (type === 's') setSeconds(value);
    if (!hasChanged && (value !== initialDuration.hours || value !== initialDuration.minutes || value !== initialDuration.seconds)) {
      setHasChanged(true);
    }
  }

  // Generate typed arrays for picker data
  const hoursData: PickerData[] = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
  }));
  
  const minutesData: PickerData[] = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
  }));
  
  const secondsData: PickerData[] = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
  }));

  // Generate warmup options
  const warmupOptions = Array.from({ length: 31 }, (_, i) => i);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={pickerModalStyles.overlay}>
        {/* Header absolutely at the top */}
        <View style={[pickerModalStyles.absoluteHeaderRow, { paddingTop: 0, top: 0 }]}> 
          {hasChanged ? (
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel duration selection">
              <Text style={pickerModalStyles.cancel}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={pickerModalStyles.title}>Duration</Text>
          {hasChanged ? (
            <TouchableOpacity onPress={handleSave} accessibilityRole="button" accessibilityLabel="Save duration selection">
              <Text style={pickerModalStyles.save}>Save</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Infinity button below Save, right-aligned */}
        {hasChanged && (
          <View style={pickerModalStyles.infinityRowBelowHeader}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Infinity mode">
              <MaterialCommunityIcons name="infinity" size={28} color="#fff" style={{ opacity: 0.7 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Transparent modal container, pickers are centered and transparent */}
        <View style={[pickerModalStyles.modalContainer, { width: width, backgroundColor: 'transparent', justifyContent: 'center', flex: 1 }]}> 
          <View style={pickerModalStyles.pickerRow}>
            {/* Hours Picker */}
            <View style={pickerModalStyles.pickerColTransparent}>
              <ScrollPicker
                dataSource={hoursData}
                selectedIndex={hours}
                renderItem={(data: PickerData, index: number, isSelected: boolean) => (
                  <View style={[
                    pickerModalStyles.slotContainer,
                    isSelected && pickerModalStyles.slotSelected
                  ]}>
                    <Text style={[
                      pickerModalStyles.slotText,
                      isSelected && pickerModalStyles.slotSelectedText
                    ]}>
                      {data.label}
                    </Text>
                  </View>
                )}
                onValueChange={(data: PickerData, selectedIndex: number) => handleTimeChange('h', selectedIndex)}
                wrapperHeight={180}
                wrapperWidth={80}
                wrapperBackground="#00000000"
                itemHeight={40}
                highlightColor="#00000000"
                highlightBorderWidth={0}
              />
              <Text style={pickerModalStyles.unit}>h</Text>
            </View>

            {/* Minutes Picker */}
            <View style={pickerModalStyles.pickerColTransparent}>
              <ScrollPicker
                dataSource={minutesData}
                selectedIndex={minutes}
                renderItem={(data: PickerData, index: number, isSelected: boolean) => (
                  <View style={[
                    pickerModalStyles.slotContainer,
                    isSelected && pickerModalStyles.slotSelected
                  ]}>
                    <Text style={[
                      pickerModalStyles.slotText,
                      isSelected && pickerModalStyles.slotSelectedText
                    ]}>
                      {data.label}
                    </Text>
                  </View>
                )}
                onValueChange={(data: PickerData, selectedIndex: number) => handleTimeChange('m', selectedIndex)}
                wrapperHeight={180}
                wrapperWidth={80}
                wrapperBackground="#00000000"
                itemHeight={40}
                highlightColor="#00000000"
                highlightBorderWidth={0}
              />
              <Text style={pickerModalStyles.unit}>m</Text>
            </View>

            {/* Seconds Picker */}
            <View style={pickerModalStyles.pickerColTransparent}>
              <ScrollPicker
                dataSource={secondsData}
                selectedIndex={seconds}
                renderItem={(data: PickerData, index: number, isSelected: boolean) => (
                  <View style={[
                    pickerModalStyles.slotContainer,
                    isSelected && pickerModalStyles.slotSelected
                  ]}>
                    <Text style={[
                      pickerModalStyles.slotText,
                      isSelected && pickerModalStyles.slotSelectedText
                    ]}>
                      {data.label}
                    </Text>
                  </View>
                )}
                onValueChange={(data: PickerData, selectedIndex: number) => handleTimeChange('s', selectedIndex)}
                wrapperHeight={180}
                wrapperWidth={80}
                wrapperBackground="#00000000"
                itemHeight={40}
                highlightColor="#00000000"
                highlightBorderWidth={0}
              />
              <Text style={pickerModalStyles.unit}>s</Text>
            </View>
          </View>

          {/* Meditation dropdown */}
          <View style={pickerModalStyles.meditationRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={pickerModalStyles.meditationText}>Meditation</Text>
              <Ionicons name="chevron-down" size={24} color="#fff" style={{ marginLeft: 4, marginTop: 2 }} />
            </View>
          </View>

          {/* Warm Up options - horizontally scrollable, more margin top */}
          <View style={[pickerModalStyles.warmupRow, { marginTop: 48 }]}> 
            <Text style={pickerModalStyles.warmupLabel}>Warm Up</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={pickerModalStyles.warmupScrollContent}
            >
              {warmupOptions.map((sec) => (
                <TouchableOpacity
                  key={sec}
                  onPress={() => setSelectedWarmup(sec)}
                  style={[
                    pickerModalStyles.warmupOption,
                    sec === selectedWarmup && pickerModalStyles.warmupSelected
                  ]}
                >
                  <Text style={[
                    pickerModalStyles.warmupOptionText,
                    sec === selectedWarmup && pickerModalStyles.warmupSelectedText
                  ]}>
                    {sec}s
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const pickerModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  absoluteHeaderRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 12,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    justifyContent: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 0,
    minHeight: 200,
  },
  pickerColTransparent: {
    alignItems: 'center',
    marginHorizontal: 12,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 8,
    width: 80,
  },
  slotContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  slotSelected: {
    backgroundColor: SELECTED_BG,
    borderRadius: 8,
  },
  slotText: {
    color: UNSELECTED_TEXT,
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
  },
  slotSelectedText: {
    color: SELECTED_TEXT,
    fontWeight: '600',
  },
  unit: {
    color: '#fff',
    fontSize: 18,
    marginTop: 2,
    fontWeight: '400',
  },
  cancel: { color: '#FF3B30', fontSize: 20, fontWeight: '500' },
  save: { color: '#FF3B30', fontSize: 20, fontWeight: '500' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 },
  infinityRow: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  infinityRowBelowHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 30,
    marginBottom: 8,
  },
  infinityIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
    opacity: 0.7,
  },
  meditationRow: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  meditationText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  warmupRow: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  warmupLabel: {
    color: '#888',
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '500',
  },
  warmupScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  warmupOption: {
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  warmupOptionText: {
    color: '#888',
    fontSize: 18,
  },
  warmupSelected: {
    borderColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  warmupSelectedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});