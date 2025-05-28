import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { CheckInProvider, useCheckIn } from '@/components/providers/CheckInProvider';
import { CheckInButton } from '@/components/check-in/check-in-button';
import { SessionInfo } from '@/components/check-in/session-info';
import { HistoryList } from '@/components/check-in/history-list';
import { MoodModal } from '@/components/check-in/mood-modal';

function CheckInScreenContent() {
  const { isCheckedIn, checkInTime, currentSession, history, checkIn, checkOut, addMood, clearHistory } = useCheckIn();
  const [showMood, setShowMood] = useState(false);

  function handleCheckIn() {
    checkIn();
  }
  function handleCheckOut() {
    checkOut();
    setTimeout(() => setShowMood(true), 400);
  }
  function handleMood(mood: string, reflection: string) {
    addMood(mood, reflection);
    setShowMood(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Check In</Text>
      {!isCheckedIn && <Text style={styles.status}>You are not checked in</Text>}
      <CheckInButton isCheckedIn={isCheckedIn} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
      {isCheckedIn && checkInTime && (
        <SessionInfo checkInTime={checkInTime} meditationType={currentSession?.meditationType} />
      )}
      <HistoryList history={history} onClear={clearHistory} />
      <MoodModal visible={showMood} onClose={() => setShowMood(false)} onSubmit={handleMood} />
    </SafeAreaView>
  );
}

export default function CheckInScreen() {
  return (
    <CheckInProvider>
      <CheckInScreenContent />
    </CheckInProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 24, marginBottom: 8 },
  status: { color: '#888', fontSize: 18, textAlign: 'center', marginBottom: 8 },
});
