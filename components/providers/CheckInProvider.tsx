import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Session {
  id: string;
  checkInTime: number;
  checkOutTime?: number;
  meditationType?: string;
  mood?: string;
  reflection?: string;
}

interface CheckInContextProps {
  isCheckedIn: boolean;
  checkInTime: number | null;
  currentSession: Session | null;
  history: Session[];
  checkIn: (meditationType?: string) => void;
  checkOut: () => void;
  addMood: (mood: string, reflection?: string) => void;
  clearHistory: () => void;
}

const CheckInContext = createContext<CheckInContextProps | undefined>(undefined);

const HISTORY_KEY = 'CHECKIN_HISTORY';

export function CheckInProvider({ children }: { children: ReactNode }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<number | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [history, setHistory] = useState<Session[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then(data => {
      if (data) setHistory(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  function checkIn(meditationType?: string) {
    if (isCheckedIn) return;
    const now = Date.now();
    const session: Session = {
      id: now.toString(),
      checkInTime: now,
      meditationType,
    };
    setIsCheckedIn(true);
    setCheckInTime(now);
    setCurrentSession(session);
  }

  function checkOut() {
    if (!isCheckedIn || !currentSession) return;
    const now = Date.now();
    const finishedSession = { ...currentSession, checkOutTime: now };
    setHistory([finishedSession, ...history]);
    setIsCheckedIn(false);
    setCheckInTime(null);
    setCurrentSession(null);
  }

  function addMood(mood: string, reflection?: string) {
    if (!history.length) return;
    const [latest, ...rest] = history;
    setHistory([{ ...latest, mood, reflection }, ...rest]);
  }

  function clearHistory() {
    setHistory([]);
  }

  return (
    <CheckInContext.Provider value={{ isCheckedIn, checkInTime, currentSession, history, checkIn, checkOut, addMood, clearHistory }}>
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn() {
  const ctx = useContext(CheckInContext);
  if (!ctx) throw new Error('useCheckIn must be used within CheckInProvider');
  return ctx;
} 