import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  checkInTime: number;
  meditationType?: string;
}

export function SessionInfo({ checkInTime, meditationType }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - checkInTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [checkInTime]);

  function formatElapsed(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Session in progress</Text>
      <Text style={styles.type}>{meditationType || 'Meditation'}</Text>
      <Text style={styles.time}>Started: {new Date(checkInTime).toLocaleTimeString()}</Text>
      <Text style={styles.elapsed}>Elapsed: {formatElapsed(elapsed)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 24 },
  label: { color: '#888', fontSize: 18, marginBottom: 4 },
  type: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  time: { color: '#bbb', fontSize: 16, marginBottom: 2 },
  elapsed: { color: '#2dd36f', fontSize: 20, fontWeight: 'bold' },
}); 