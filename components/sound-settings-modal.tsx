import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Audio } from 'expo-av';

interface SoundSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (startingBellVolume: number, endingBellVolume: number) => void;
  initialStartingBellVolume: number;
  initialEndingBellVolume: number;
  playBellSound: (volume: number) => Promise<void>; // Function to play bell sound with a specific volume
}

export function SoundSettingsModal({
  isVisible,
  onClose,
  onSave,
  initialStartingBellVolume,
  initialEndingBellVolume,
  playBellSound,
}: SoundSettingsModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { width } = useWindowDimensions();

  const [startingBellVolume, setStartingBellVolume] = useState(initialStartingBellVolume);
  const [endingBellVolume, setEndingBellVolume] = useState(initialEndingBellVolume);
  const [deviceVolume, setDeviceVolume] = useState(0.5); // Placeholder for device volume

  // Effect to fetch initial device volume (Expo Audio API might be needed for real implementation)
  useEffect(() => {
    // In a real Expo app, you would fetch device volume here.
    // For now, using a placeholder.
    // Example: Audio.getAudioRecorderPlaybackStatusAsync().then(status => { if (status.isLoaded) setDeviceVolume(status.volume); });
  }, []);

  const handleSave = () => {
    onSave(startingBellVolume, endingBellVolume);
    onClose();
  };

  const handleCancel = () => {
    // Reset volumes to initial values before closing if needed, or just close
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background, width: width * 0.9 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Sound Settings</Text>
          </View>

          {/* Device Volume */}
          <View style={styles.volumeSection}>
            <Text style={[styles.volumeLabel, { color: theme.textSecondary }]}>Your device volume</Text>
            <Text style={[styles.volumeText, { color: theme.text }]}>{Math.round(deviceVolume * 100)}%</Text>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={deviceVolume}
              onValueChange={setDeviceVolume} // In a real app, this might control actual device volume or just reflect it
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.textSecondary}
              thumbTintColor={theme.accent}
            />
            <Text style={[styles.volumeDescription, { color: theme.textSecondary }]}>
              Adjust individual items as a percentage of your device volume
            </Text>
          </View>

          {/* Starting Bell Volume */}
          <View style={styles.bellVolumeRow}>
            <Text style={[styles.bellLabel, { color: theme.text }]}>Starting bell {Math.round(startingBellVolume * 100)}%</Text>
            <TouchableOpacity onPress={() => playBellSound(startingBellVolume)} accessibilityLabel="Play starting bell preview">
                <Feather name="play-circle" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>
          <Slider
            style={styles.bellVolumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={startingBellVolume}
            onValueChange={setStartingBellVolume}
            minimumTrackTintColor={theme.accent}
            maximumTrackTintColor={theme.textSecondary}
            thumbTintColor={theme.accent}
          />

          {/* Ending Bell Volume */}
          <View style={styles.bellVolumeRow}>
            <Text style={[styles.bellLabel, { color: theme.text }]}>Ending bell {Math.round(endingBellVolume * 100)}%</Text>
             <TouchableOpacity onPress={() => playBellSound(endingBellVolume)} accessibilityLabel="Play ending bell preview">
                <Feather name="play-circle" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>
          <Slider
            style={styles.bellVolumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={endingBellVolume}
            onValueChange={setEndingBellVolume}
            minimumTrackTintColor={theme.accent}
            maximumTrackTintColor={theme.textSecondary}
            thumbTintColor={theme.accent}
          />

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleCancel} style={styles.button} accessibilityRole="button" accessibilityLabel="Cancel sound settings">
              <Text style={[styles.cancelButtonText, { color: theme.accent }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: theme.accent }]} accessibilityRole="button" accessibilityLabel="Save sound settings">
              <Text style={[styles.saveButtonText, { color: theme.background }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 12,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  volumeSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  volumeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  volumeSlider: {
    width: '100%',
    marginTop: 8,
  },
  volumeDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  bellVolumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  bellLabel: {
    fontSize: 18,
  },
  bellVolumeSlider: {
    width: '100%',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 