import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface GratitudeBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  onClose: () => void;
  onPost: (name: string, text: string) => void;
}

const colors = {
  background: '#121212',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  separator: '#333333',
  gratitudeButton: '#00BFA5',
};

export function GratitudeBottomSheet({ bottomSheetRef, onClose, onPost }: GratitudeBottomSheetProps) {
  const [gratitudeText, setGratitudeText] = useState('');
  const [name, setName] = useState('');
  const snapPoints = ['85%'];

  const handlePost = useCallback(() => {
    if (name.trim() && gratitudeText.trim()) {
      onPost(name.trim(), gratitudeText.trim());
      setGratitudeText('');
      setName('');
      onClose();
    }
  }, [gratitudeText, name, onPost, onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={(index) => {
        if (index === -1) {
          Keyboard.dismiss();
          onClose();
        }
      }}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
      enableDynamicSizing={false}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      backdropComponent={renderBackdrop}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.bottomSheetContainer}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Feather name="x" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.inputContainer}>
              <BottomSheetTextInput
                placeholder="First name (required)"
                placeholderTextColor={colors.textSecondary}
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />

              <Text style={styles.gratitudeQuestion}>
                What are you grateful for today?
              </Text>

              <BottomSheetTextInput
                placeholder="Share your gratitude..."
                placeholderTextColor={colors.textSecondary}
                style={styles.gratitudeInput}
                value={gratitudeText}
                onChangeText={setGratitudeText}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />

              <Text style={styles.characterCount}>
                {gratitudeText.length} / 500
              </Text>
            </View>
          </KeyboardAwareScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.postButton,
              (!name.trim() || !gratitudeText.trim()) && styles.postButtonDisabled,
            ]}
            onPress={handlePost}
            disabled={!name.trim() || !gratitudeText.trim()}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    marginTop: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 40,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
  },
  bottomSheetBackground: {
    backgroundColor: colors.background,
  },
  bottomSheetIndicator: {
    backgroundColor: colors.textSecondary,
    width: 40,
    height: 4,
  },
  bottomSheetContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginLeft: 10,
    marginTop: 10,
    zIndex: 1,
  },
  nameInput: {
    fontFamily: 'Serif',
    fontSize: 16,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    paddingVertical: 10,
    marginBottom: 30,
  },
  gratitudeQuestion: {
    fontFamily: 'Serif',
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  gratitudeInput: {
    fontFamily: 'Serif',
    fontSize: 16,
    color: colors.textPrimary,
    height: 150,
    padding: 0,
  },
  characterCount: {
    fontFamily: 'Serif',
    fontSize: 14,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    paddingVertical: Platform.OS === 'ios' ? 20 : 15,
    backgroundColor: colors.background,
  },
  postButton: {
    backgroundColor: colors.gratitudeButton,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontFamily: 'Serif-Bold',
    fontSize: 16,
    color: colors.textPrimary,
  },
});