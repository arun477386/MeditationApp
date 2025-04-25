import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './firebase';
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const authService = {
  // 🔹 Sign up with Email/Password and store Firestore user profile
  signUpWithEmail: async (email: string, password: string): Promise<User> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // 🔸 Create Firestore user profile document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: '', // Name can be updated later in profile
        email: user.email,
        avatarUrl: '',
        bio: '',
        location: '',
        timezone: '',
        createdAt: serverTimestamp(),
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            dailyReminder: true,
            friendRequests: true,
            courseUpdates: true
          }
        }
      });

      return user;
    } catch (error: any) {
      console.error('Sign-up error:', error.message);
      throw error;
    }
  },

  signInWithEmail: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  signInWithGoogle: async (): Promise<User> => {
    try {
      const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });

      if (response?.type === 'success') {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const result = await signInWithPopup(auth, credential);
        return result.user;
      } else {
        throw new Error('Google sign in failed');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error.message);
      throw error;
    }
  }
};
