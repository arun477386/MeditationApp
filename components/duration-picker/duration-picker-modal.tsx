import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { useColorScheme, useWindowDimensions } from 'react-native';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export interface DurationPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (duration: { hours: number; minutes: number; seconds: number }) => void;
  initialDuration?: { hours: number; minutes: number; seconds: number };
}

const SELECTED_BG = 'rgba(40,40,40,0.8)';
const SELECTED_TEXT = '#fff';
const UNSELECTED_TEXT = '#888';

function renderPickerItem(selectedIndex: number) {
  return function PickerItem(props: any) {
    const { item, index } = props;
    if (!item) return <View />;
    const isSelected = index === selectedIndex;
    return (
      <View
        style={{
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          backgroundColor: isSelected ? SELECTED_BG : 'transparent',
          marginVertical: 2,
          minWidth: 48,
          paddingHorizontal: 8,
        } as ViewStyle}
      >
        <Text
          style={{
            color: isSelected ? SELECTED_TEXT : UNSELECTED_TEXT,
            fontWeight: isSelected ? 'bold' : '400',
            fontSize: 24,
            opacity: isSelected ? 1 : 0.6,
            letterSpacing: 1,
          } as TextStyle}
        >
          {item.label}
        </Text>
      </View>
    );
  };
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
                dataSource={[...Array(24).keys()].map(i => i.toString().padStart(2, '0'))}
                selectedIndex={hours}
                renderItem={(data, index, isSelected) => (
                  <View style={isSelected ? pickerModalStyles.slotSelected : pickerModalStyles.slotUnselected}>
                    <Text style={isSelected ? pickerModalStyles.slotSelectedText : pickerModalStyles.slotUnselectedText}>{data}</Text>
                  </View>
                )}
                onValueChange={(data, selectedIndex) => handleTimeChange('h', selectedIndex)}
                wrapperHeight={180}
                wrapperBackground={'transparent'}
                itemHeight={40}
                highlightColor={'rgba(40,40,40,0.8)'}
                highlightBorderWidth={0}
              />
              <Text style={pickerModalStyles.unit}>h</Text>
            </View>
            {/* Minutes Picker */}
            <View style={pickerModalStyles.pickerColTransparent}>
              <ScrollPicker
                dataSource={[...Array(60).keys()].map(i => i.toString().padStart(2, '0'))}
                selectedIndex={minutes}
                renderItem={(data, index, isSelected) => (
                  <View style={isSelected ? pickerModalStyles.slotSelected : pickerModalStyles.slotUnselected}>
                    <Text style={isSelected ? pickerModalStyles.slotSelectedText : pickerModalStyles.slotUnselectedText}>{data}</Text>
                  </View>
                )}
                onValueChange={(data, selectedIndex) => handleTimeChange('m', selectedIndex)}
                wrapperHeight={180}
                wrapperBackground={'transparent'}
                itemHeight={40}
                highlightColor={'rgba(40,40,40,0.8)'}
                highlightBorderWidth={0}
              />
              <Text style={pickerModalStyles.unit}>m</Text>
            </View>
            {/* Seconds Picker */}
            <View style={pickerModalStyles.pickerColTransparent}>
              <ScrollPicker
                dataSource={[...Array(60).keys()].map(i => i.toString().padStart(2, '0'))}
                selectedIndex={seconds}
                renderItem={(data, index, isSelected) => (
                  <View style={isSelected ? pickerModalStyles.slotSelected : pickerModalStyles.slotUnselected}>
                    <Text style={isSelected ? pickerModalStyles.slotSelectedText : pickerModalStyles.slotUnselectedText}>{data}</Text>
                  </View>
                )}
                onValueChange={(data, selectedIndex) => handleTimeChange('s', selectedIndex)}
                wrapperHeight={180}
                wrapperBackground={'transparent'}
                itemHeight={40}
                highlightColor={'rgba(40,40,40,0.8)'}
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8 }}>
              {[...Array(31).keys()].map((sec) => (
                <View
                  key={sec}
                  style={sec === 0 ? pickerModalStyles.warmupSelected : pickerModalStyles.warmupOption}
                >
                  <Text style={sec === 0 ? pickerModalStyles.warmupSelectedText : pickerModalStyles.warmupOptionText}>
                    {sec}s
                  </Text>
                </View>
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
  wheel: {
    width: 70,
    height: 180,
    backgroundColor: 'transparent',
  },
  wheelItem: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
  },
  selectedIndicator: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    height: 40,
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
  warmupOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
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
  slotSelected: {
    backgroundColor: 'rgba(40,40,40,0.8)',
    borderRadius: 12,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginVertical: 2,
  },
  slotSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
  },
  slotUnselected: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginVertical: 2,
  },
  slotUnselectedText: {
    color: '#888',
    fontWeight: '400',
    fontSize: 20,
    opacity: 0.6,
    letterSpacing: 1,
  },
});