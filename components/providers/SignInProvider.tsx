import React, { createContext, useContext, useRef } from 'react';
import { SignInBottomSheet, SignInBottomSheetRef } from '@/components/auth/SignInBottomSheet';
import { InteractionManager } from 'react-native';

interface SignInContextType {
  presentSignIn: () => void;
}

const SignInContext = createContext<SignInContextType | null>(null);

export function SignInProvider({ children }: { children: React.ReactNode }) {
  const signInBottomSheetRef = useRef<SignInBottomSheetRef>(null);

  const presentSignIn = () => {
    if (!signInBottomSheetRef.current) {
      console.error('SignInProvider: bottomSheetRef is null');
      return;
    }
    InteractionManager.runAfterInteractions(() => {
      signInBottomSheetRef.current?.present();
    });
  };

  return (
    <SignInContext.Provider value={{ presentSignIn }}>
      {children}
      <SignInBottomSheet ref={signInBottomSheetRef} />
    </SignInContext.Provider>
  );
}

export function useSignIn() {
  const context = useContext(SignInContext);
  if (!context) {
    throw new Error('useSignIn must be used within a SignInProvider');
  }
  return context;
} 