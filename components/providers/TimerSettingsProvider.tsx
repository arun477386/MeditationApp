import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Duration {
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimerSettingsContextProps {
  duration: Duration;
  meditationType: string;
  setDuration: (d: Duration) => void;
  setMeditationType: (type: string) => void;
  isInfinity: boolean;
  setIsInfinity: (v: boolean) => void;
}

const TimerSettingsContext = createContext<TimerSettingsContextProps | undefined>(undefined);

export function TimerSettingsProvider({ children }: { children: ReactNode }) {
  const [duration, setDuration] = useState<Duration>({ hours: 0, minutes: 5, seconds: 0 });
  const [meditationType, setMeditationType] = useState('Meditation');
  const [isInfinity, setIsInfinity] = useState(false);

  return (
    <TimerSettingsContext.Provider value={{ duration, meditationType, setDuration, setMeditationType, isInfinity, setIsInfinity }}>
      {children}
    </TimerSettingsContext.Provider>
  );
}

export function useTimerSettings() {
  const ctx = useContext(TimerSettingsContext);
  if (!ctx) throw new Error('useTimerSettings must be used within TimerSettingsProvider');
  return ctx;
} 