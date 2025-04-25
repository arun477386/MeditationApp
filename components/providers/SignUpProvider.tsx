import React, { createContext, useContext, useRef } from 'react';
import { SignUpBottomSheet, SignUpBottomSheetRef } from '@/components/auth/SignUpBottomSheet';

interface SignUpContextType {
  presentSignUp: () => void;
}

const SignUpContext = createContext<SignUpContextType | null>(null);

export function SignUpProvider({ children }: { children: React.ReactNode }) {
  const signUpBottomSheetRef = useRef<SignUpBottomSheetRef>(null);

  const presentSignUp = () => {
    if (!signUpBottomSheetRef.current) {
      console.error('SignUpProvider: bottomSheetRef is null');
      return;
    }
    signUpBottomSheetRef.current.present();
  };

  return (
    <SignUpContext.Provider value={{ presentSignUp }}>
      {children}
      <SignUpBottomSheet ref={signUpBottomSheetRef} />
    </SignUpContext.Provider>
  );
}

export function useSignUp() {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignUp must be used within a SignUpProvider');
  }
  return context;
} 