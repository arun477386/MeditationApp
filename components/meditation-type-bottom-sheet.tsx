import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface MeditationTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  selectedType: string;
}

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

export function MeditationTypeBottomSheet({ visible, onClose, onSelect, selectedType }: MeditationTypeModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>  
          <Text style={[styles.title, { color: theme.text }]}>Select Meditation Type</Text>
          <FlatList
            data={MEDITATION_TYPES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === item && { backgroundColor: theme.accent },
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedType === item }}
              >
                <Text style={[
                  styles.typeText,
                  { color: selectedType === item ? theme.background : theme.text }
                ]}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} accessibilityRole="button">
            <Text style={[styles.cancelText, { color: theme.accent }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    minHeight: 340,
    maxHeight: '70%',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    alignSelf: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  typeBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  typeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 