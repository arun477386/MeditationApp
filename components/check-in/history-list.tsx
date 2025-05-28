import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

interface Session {
  id: string;
  checkInTime: number;
  checkOutTime?: number;
  meditationType?: string;
  mood?: string;
  reflection?: string;
}

interface Props {
  history: Session[];
  onClear: () => void;
}

export function HistoryList({ history, onClear }: Props) {
  function formatDuration(start: number, end?: number) {
    if (!end) return '--:--';
    const sec = Math.floor((end - start) / 1000);
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Session History</Text>
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.type}>{item.meditationType || 'Meditation'}</Text>
            <Text style={styles.time}>{new Date(item.checkInTime).toLocaleString()}</Text>
            <Text style={styles.duration}>Duration: {formatDuration(item.checkInTime, item.checkOutTime)}</Text>
            {item.mood && <Text style={styles.mood}>Mood: {item.mood}</Text>}
            {item.reflection && <Text style={styles.reflection}>{item.reflection}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No sessions yet.</Text>}
        style={{ maxHeight: 320 }}
      />
      <TouchableOpacity onPress={onClear} style={styles.clearBtn} accessibilityRole="button" accessibilityLabel="Clear history">
        <Text style={styles.clearText}>Clear History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, paddingHorizontal: 16 },
  header: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  item: { backgroundColor: '#222', borderRadius: 12, padding: 16, marginBottom: 12 },
  type: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  time: { color: '#bbb', fontSize: 14, marginBottom: 2 },
  duration: { color: '#2dd36f', fontSize: 16, marginBottom: 2 },
  mood: { color: '#ffd700', fontSize: 16 },
  reflection: { color: '#aaa', fontSize: 15, fontStyle: 'italic' },
  empty: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 32 },
  clearBtn: { marginTop: 16, alignSelf: 'center', backgroundColor: '#444', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  clearText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
}); 