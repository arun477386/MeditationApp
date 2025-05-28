import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (mood: string, reflection: string) => void;
}

const MOODS = ['😊', '😌', '😐', '😔', '😢'];

export function MoodModal({ visible, onClose, onSubmit }: Props) {
  const [selectedMood, setSelectedMood] = useState('');
  const [reflection, setReflection] = useState('');

  function handleSubmit() {
    if (selectedMood) onSubmit(selectedMood, reflection);
    setSelectedMood('');
    setReflection('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>How was your session?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(mood => (
              <TouchableOpacity
                key={mood}
                onPress={() => setSelectedMood(mood)}
                style={[styles.moodBtn, selectedMood === mood && styles.moodSelected]}
                accessibilityRole="button"
                accessibilityLabel={`Mood: ${mood}`}
              >
                <Text style={styles.mood}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Reflection (optional)"
            placeholderTextColor="#888"
            value={reflection}
            onChangeText={setReflection}
            multiline
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn} accessibilityRole="button">
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn} accessibilityRole="button">
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#222', borderRadius: 16, padding: 24, width: 320, alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  moodRow: { flexDirection: 'row', marginBottom: 16 },
  moodBtn: { marginHorizontal: 8, padding: 8, borderRadius: 8, backgroundColor: '#333' },
  moodSelected: { backgroundColor: '#2dd36f' },
  mood: { fontSize: 32 },
  input: { backgroundColor: '#333', color: '#fff', borderRadius: 8, padding: 12, width: '100%', minHeight: 60, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cancelBtn: { flex: 1, marginRight: 8, backgroundColor: '#444', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveBtn: { flex: 1, marginLeft: 8, backgroundColor: '#2dd36f', borderRadius: 8, padding: 12, alignItems: 'center' },
  cancelText: { color: '#fff', fontSize: 16 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
}); 