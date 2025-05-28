import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';

interface Props {
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export function CheckInButton({ isCheckedIn, onCheckIn, onCheckOut }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCheckedIn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckedIn]);

  return (
    <View style={styles.center}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[styles.button, isCheckedIn ? styles.checkedIn : styles.checkedOut]}
          onPress={isCheckedIn ? onCheckOut : onCheckIn}
          accessibilityRole="button"
          accessibilityLabel={isCheckedIn ? 'Check out' : 'Check in'}
        >
          <Text style={styles.buttonText}>{isCheckedIn ? 'Check Out' : 'Check In'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 32 },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  checkedIn: {
    backgroundColor: '#2dd36f',
  },
  checkedOut: {
    backgroundColor: '#3880ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
}); 