import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '@/services/authService';
import { Colors } from '@/constants/Colors';

export interface SignInBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

export const SignInBottomSheet = forwardRef<SignInBottomSheetRef>((_, ref) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  useImperativeHandle(ref, () => ({
    present: () => {
      if (!bottomSheetRef.current) return;
      try {
        bottomSheetRef.current.present();
      } catch (error) {
        console.error('SignInBottomSheet: Error presenting', error);
      }
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
    },
  }));

  const handleEmailAuth = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      await authService.signUpWithEmail(email, password);
      Alert.alert('Success', 'Account created successfully!');
      bottomSheetRef.current?.dismiss();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during sign up');
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      pressBehavior="close"
    />
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['50%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }}
      handleIndicatorStyle={{ backgroundColor: isDark ? '#666' : '#999' }}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      style={styles.bottomSheet}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingBottom: insets.bottom }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => bottomSheetRef.current?.dismiss()}
          >
            <Feather name="x" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Welcome Back
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#3A3A3A' : '#E0E0E0'
                }
              ]}
              placeholder="Email"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderColor: isDark ? '#3A3A3A' : '#E0E0E0'
                }
              ]}
              placeholder="Password"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#00BFA5' }]}
            onPress={handleEmailAuth}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={[styles.forgotPasswordText, { color: isDark ? '#00BFA5' : '#00BFA5' }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
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
  inputContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  forgotPasswordButton: {
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

SignInBottomSheet.displayName = 'SignInBottomSheet'; 