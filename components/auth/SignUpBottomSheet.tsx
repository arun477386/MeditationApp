import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/services/authService';
import { router } from 'expo-router';

export interface SignUpBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

export const SignUpBottomSheet = forwardRef<SignUpBottomSheetRef>((_, ref) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const emailInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const [isSignIn, setIsSignIn] = useState(false);
  const [showInputForm, setShowInputForm] = useState(false);

  useImperativeHandle(ref, () => ({
    present: () => {
      if (!bottomSheetRef.current) {
        return;
      }
      try {
        setEmail('');
        setPassword('');
        setIsSignIn(false);
        setShowInputForm(false);
        bottomSheetRef.current.present();
      } catch (error) {
        console.error('SignUpBottomSheet: Error presenting', error);
      }
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
      setEmail('');
      setPassword('');
      setIsSignIn(false);
      setShowInputForm(false);
    },
  }));

  const handleEmailAuth = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      if (isSignIn) {
        await authService.signInWithEmail(email, password);
        Alert.alert('Success', 'Signed in successfully!');
        bottomSheetRef.current?.dismiss();
        router.replace('/(tabs)');
      } else {
        await authService.signUpWithEmail(email, password);
        Alert.alert('Success', 'Account created successfully!');
        bottomSheetRef.current?.dismiss();
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during authentication');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await authService.signInWithGoogle();
      Alert.alert('Success', 'Signed in with Google successfully!');
      bottomSheetRef.current?.dismiss();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    }
  };

  const handleEmailSignUp = () => {
    setShowInputForm(true);
    setIsSignIn(false);
    bottomSheetRef.current?.expand();
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  };

  const handleSignIn = () => {
    setShowInputForm(true);
    setIsSignIn(true);
    bottomSheetRef.current?.expand();
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      pressBehavior="close"
    />
  );

  const renderInitialView = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
      
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: colors.background }]}
          onPress={handleGoogleAuth}
        >
          <GoogleIcon />
          <Text style={[styles.socialButtonText, { color: colors.text }]}>Sign up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: colors.background }]}
          onPress={handleEmailSignUp}
        >
          <Feather name="mail" size={24} color={colors.text} />
          <Text style={[styles.socialButtonText, { color: colors.text }]}>Sign up with Email</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={handleSignIn}
      >
        <Text style={[styles.toggleText, { color: colors.text }]}>
          Already have an account? <Text style={{ color: '#00BFA5' }}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderSignUpView = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          ref={emailInputRef}
          style={[styles.input, { 
            backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
            color: colors.text,
            borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
          }]}
          placeholder="Email"
          placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { 
            backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
            color: colors.text,
            borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
          }]}
          placeholder="Password"
          placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.background }]}
        onPress={handleEmailAuth}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={handleSignIn}
      >
        <Text style={[styles.toggleText, { color: colors.text }]}>
          Already have an account? <Text style={{ color: '#00BFA5' }}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderSignInView = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          ref={emailInputRef}
          style={[styles.input, { 
            backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
            color: colors.text,
            borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
          }]}
          placeholder="Email"
          placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { 
            backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
            color: colors.text,
            borderColor: colorScheme === 'dark' ? '#3A3A3A' : '#E0E0E0'
          }]}
          placeholder="Password"
          placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.background }]}
        onPress={handleEmailAuth}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={handleEmailSignUp}
      >
        <Text style={[styles.toggleText, { color: colors.text }]}>
          Don't have an account? <Text style={{ color: '#00BFA5' }}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={showInputForm ? ['80%'] : ['40%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.tabIconDefault }}
      style={styles.bottomSheet}
      enableDynamicSizing={false}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingBottom: insets.bottom }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          {!showInputForm ? renderInitialView() : isSignIn ? renderSignInView() : renderSignUpView()}
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  bottomSheet: {
    zIndex: 9999,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  socialButtonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  input: {
    height: 56,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    height: 56,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 16,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom:30
  }
});

SignUpBottomSheet.displayName = 'SignUpBottomSheet';
