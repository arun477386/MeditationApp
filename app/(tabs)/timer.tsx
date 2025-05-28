import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, ScrollView, Animated, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import WheelPicker from 'react-native-wheel-picker-expo';
import { DurationPickerModal } from '../../components/duration-picker/duration-picker-modal';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Audio } from 'expo-av';
import { MeditationTypeBottomSheet } from '../../components/meditation-type-bottom-sheet';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTimerSettings } from '@/components/providers/TimerSettingsProvider';
import Slider from '@react-native-community/slider';
import { PanGestureHandler, State, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export function TimerScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { duration, meditationType, setMeditationType, isInfinity } = useTimerSettings();
  const [bellSound, setBellSound] = React.useState<Audio.Sound | null>(null);
  const [showTypeSheet, setShowTypeSheet] = React.useState(false);
  const [showTimerScreen, setShowTimerScreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration.hours * 3600 + duration.minutes * 60 + duration.seconds);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const prevSettingsRef = useRef<{ duration: string; meditationType: string } | null>(null);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [deviceVolume, setDeviceVolume] = useState(1);
  const [startBellVolume, setStartBellVolume] = useState(1);
  const [endBellVolume, setEndBellVolume] = useState(1);
  const [pendingDeviceVolume, setPendingDeviceVolume] = useState(deviceVolume);
  const [pendingStartBellVolume, setPendingStartBellVolume] = useState(startBellVolume);
  const [pendingEndBellVolume, setPendingEndBellVolume] = useState(endBellVolume);
  const [modalTranslateY, setModalTranslateY] = useState(0);
  const modalSheetRef = useRef<View>(null);
  const bellSoundRef = useRef<Audio.Sound | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = offscreen right, 0 = onscreen
  const [settingsScreen, setSettingsScreen] = useState<'main' | 'bell' | 'background'>('main');
  const subScreenAnim = useRef(new Animated.Value(1)).current;
  const [bellInterval, setBellInterval] = useState(3);
  const [background, setBackground] = useState<'Black' | 'Ocean' | 'Stars' | 'Custom'>('Black');

  React.useEffect(() => {
    // Load the bell sound when component mounts
    const loadBellSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/chinese-bell.mp3'),
          { shouldPlay: false }
        );
        setBellSound(sound);
      } catch (error) {
        console.error('Error loading bell sound:', error);
      }
    };

    loadBellSound();

    // Cleanup function to unload sound when component unmounts
    return () => {
      if (bellSound) {
        bellSound.unloadAsync();
      }
    };
  }, []);

  const playBellSound = async () => {
    try {
      if (bellSound) {
        await bellSound.setPositionAsync(0); // Reset to start
        await bellSound.playAsync();
      }
    } catch (error) {
      console.error('Error playing bell sound:', error);
    }
  };

  function formatDuration(d: { hours: number; minutes: number; seconds: number }) {
    if (d.hours > 0) return `${d.hours}:${d.minutes.toString().padStart(2, '0')}:${d.seconds.toString().padStart(2, '0')}`;
    return `${d.minutes}:${d.seconds.toString().padStart(2, '0')}`;
  }

  // Update timeLeft when duration changes
  useEffect(() => {
    setTimeLeft(duration.hours * 3600 + duration.minutes * 60 + duration.seconds);
  }, [duration]);

  // Timer logic
  useEffect(() => {
    if (isInfinity) {
      if (timerInterval.current) clearInterval(timerInterval.current!);
      return;
    }
    if (showTimerScreen && isRunning && !isPaused && timeLeft > 0) {
      timerInterval.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerInterval.current!);
    }
    if (!isRunning || isPaused || timeLeft <= 0) {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    if (timeLeft === 0 && isRunning) {
      playBellSound();
      setIsRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTimerScreen, isRunning, isPaused, timeLeft, isInfinity]);

  useEffect(() => {
    const currentSettings = JSON.stringify({ duration, meditationType });
    if (prevSettingsRef.current && prevSettingsRef.current.duration !== JSON.stringify(duration)) {
      setShowTimerScreen(false);
      setIsRunning(false);
      setIsPaused(false);
      setTimeLeft(duration.hours * 3600 + duration.minutes * 60 + duration.seconds);
    }
    prevSettingsRef.current = { duration: JSON.stringify(duration), meditationType };
  }, [duration, meditationType]);

  function handlePlay() {
    setShowTimerScreen(true);
    setIsRunning(true);
    setIsPaused(false);
    setTimeLeft(duration.hours * 3600 + duration.minutes * 60 + duration.seconds);
    playBellSound(); // Play bell at start
  }

  function handlePause() {
    setIsPaused(true);
    setIsRunning(false);
    stopBellSound();
  }

  function handleResume() {
    setIsPaused(false);
    setIsRunning(true);
  }

  function handleFinish() {
    setShowTimerScreen(false);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration.hours * 3600 + duration.minutes * 60 + duration.seconds);
    stopBellSound();
  }

  function handleDiscard() {
    setShowTimerScreen(false);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration.hours * 3600 + duration.minutes * 60 + duration.seconds);
    stopBellSound();
  }

  function formatTimer(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Play bell at selected volume
  async function playTestBell(volume: number) {
    try {
      if (bellSoundRef.current) {
        await bellSoundRef.current.unloadAsync();
        bellSoundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audio/chinese-bell.mp3'),
        { shouldPlay: true, volume }
      );
      bellSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || status.didJustFinish) {
          sound.unloadAsync();
          bellSoundRef.current = null;
        }
      });
    } catch (e) {}
  }

  // Stop bell sound utility
  async function stopBellSound() {
    if (bellSoundRef.current) {
      try {
        await bellSoundRef.current.stopAsync();
        await bellSoundRef.current.unloadAsync();
      } catch {}
      bellSoundRef.current = null;
    }
  }

  // Stop bell sound when modal closes
  useEffect(() => {
    if (!showVolumeModal) stopBellSound();
  }, [showVolumeModal]);

  // Stop bell sound when leaving timer screen
  useEffect(() => {
    return () => { stopBellSound(); };
  }, []);

  function handleGestureEvent(event: PanGestureHandlerGestureEvent) {
    if (event.nativeEvent.translationY > 60) {
      setShowVolumeModal(false);
    }
  }

  function openSettings() {
    setSettingsScreen('main');
    setShowSettings(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  function closeSettings() {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setShowSettings(false));
  }

  function openSubScreen(screen: 'bell' | 'background') {
    setSettingsScreen(screen);
    Animated.timing(subScreenAnim, {
      toValue: 0,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  function closeSubScreen() {
    Animated.timing(subScreenAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setSettingsScreen('main'));
  }

  // FULLSCREEN TIMER UI CONDITIONAL RENDERING AT THE TOP
  if (showTimerScreen) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>  
        {/* Meditation type at top center */}
        <View style={{ position: 'absolute', top: 32, left: 0, right: 0, alignItems: 'center', zIndex: 2 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 22, opacity: 0.4 }}>{meditationType}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Chinese Bell</Text>
          {isPaused && <Text style={{ color: theme.text, fontSize: 18, marginBottom: 8 }}>Paused</Text>}
          {!isInfinity && (
            <>
              <Text style={{ color: theme.text, fontSize: 64, fontWeight: 'bold', marginBottom: 8 }}>{formatTimer(timeLeft)}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 18, marginBottom: 32 }}>1 bell remaining</Text>
            </>
          )}
          {isInfinity && (
            <Text style={{ color: theme.text, fontSize: 64, fontWeight: 'bold', marginBottom: 32 }}>∞</Text>
          )}
          {/* Spacer to move play/pause button higher */}
          <View style={{ height: 32 }} />
          {/* Only show play/pause button, no volume or more icon */}
          {!isPaused && isRunning && (
            <TouchableOpacity style={[styles.playBtn, { backgroundColor: theme.accent }]} accessibilityRole="button" accessibilityLabel="Pause timer" onPress={handlePause}>
              <Feather name="pause" size={48} color={theme.background} />
            </TouchableOpacity>
          )}
          {isPaused && (
            <TouchableOpacity style={[styles.playBtn, { backgroundColor: theme.accent }]} accessibilityRole="button" accessibilityLabel="Resume timer" onPress={handleResume}>
              <Feather name="play" size={48} color={theme.background} />
            </TouchableOpacity>
          )}
          {/* Finish/Discard controls */}
          {isPaused && (
            <>
              <TouchableOpacity onPress={handleFinish} style={{ backgroundColor: theme.text, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 64, marginBottom: 12, alignSelf: 'center' }}>
                <Text style={{ color: theme.background, fontSize: 20, fontWeight: '600' }}>Finish</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDiscard} style={{ marginTop: 4, alignSelf: 'center' }}>
                <Text style={{ color: theme.textSecondary, fontSize: 16, textAlign: 'center' }}>Discard session</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>  
      {/* Centered Timer heading with absolutely positioned 3-dots */}
      <View style={{ height: 60, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <Text style={[styles.tabActive, { color: theme.text, textAlign: 'center' }]}>Timer</Text>
        <TouchableOpacity
          style={{ position: 'absolute', right: 24, top: 0, height: 60, justifyContent: 'center', alignItems: 'center' }}
          onPress={openSettings}
          accessibilityRole="button"
          accessibilityLabel="Open timer settings"
        >
          <Feather name="more-horizontal" size={28} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Bell Section */}
        <TouchableOpacity 
          style={styles.bellSection} 
          onPress={playBellSound}
          accessibilityRole="button"
          accessibilityLabel="Play Chinese bell sound"
        >
          <Text style={[styles.bellLabel, { color: theme.text }]}>Ending bell</Text>
          <Image
            source={require('../../assets/images/chinese-bell.png')}
            style={styles.bellImage}
            accessibilityLabel="Chinese bell"
          />
          <View style={styles.bellLineRow}>
            <View style={[styles.bellLine, { backgroundColor: theme.text }]} />
            <View style={[styles.bellNumberCircle, { backgroundColor: theme.card }]}> 
              <Text style={[styles.bellNumber, { color: theme.text }]} >1</Text>
            </View>
            <View style={[styles.bellLine, { backgroundColor: theme.text }]} />
          </View>
          <Text style={[styles.bellName, { color: theme.textSecondary }]}>Chinese Bell</Text>
        </TouchableOpacity>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={styles.settingsRow}
            accessibilityRole="button"
            onPress={() => router.push('/duration')}
          >
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Duration</Text>
            <View style={styles.settingsValueRow}>
              <TouchableOpacity onPress={() => setShowTypeSheet(true)}>
                <Text style={[styles.settingsValue, { color: theme.textSecondary, fontWeight: 'bold', fontSize: 16 }]}> {meditationType} </Text>
              </TouchableOpacity>
              <Text style={[styles.settingsValue, { color: theme.textSecondary }]}> {formatDuration(duration)}</Text>
              <Feather name="chevron-right" size={22} color={theme.icon} />
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Ambient sounds</Text>
            <View style={styles.settingsValueRow}>
              <View style={[styles.newBadge, { backgroundColor: theme.plus }]}> <Text style={[styles.newBadgeText, { color: theme.background }]}>NEW</Text></View>
              <Feather name="chevron-right" size={22} color={theme.icon} />
            </View>
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Interval bells</Text>
            <View style={styles.settingsValueRow}>
              <Text style={[styles.settingsValue, { color: theme.textSecondary }]}>None</Text>
              <Feather name="chevron-right" size={22} color={theme.icon} />
            </View>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.settingsRow} accessibilityRole="button">
            <Text style={[styles.settingsLabel, { color: theme.text }]}>Starting bell</Text>
            <View style={styles.settingsValueRow}>
              <Text style={[styles.settingsValue, { color: theme.textSecondary }]}>Chinese Bell</Text>
              <Feather name="chevron-right" size={22} color={theme.icon} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Revert Button */}
        {/* <TouchableOpacity style={styles.revertBtn} accessibilityRole="button">
          <Text style={[styles.revertText, { color: theme.accent }]}>Revert to basic Timer &gt;&gt;</Text>
        </TouchableOpacity> */}

        {/* Spacer to push play button row up, matching screenshot */}
        <View style={{ height: 48 }} />

        {/* Play Button and Volume */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.volumeRow} onPress={() => setShowVolumeModal(true)}>
            <Feather name="volume-2" size={20} color={theme.icon} />
            <Text style={[styles.volumeText, { color: theme.textSecondary }]}>{Math.round(deviceVolume * 100)}%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.playBtn, { backgroundColor: theme.accent }]} accessibilityRole="button" accessibilityLabel="Start timer" onPress={handlePlay}>
            <Feather name="play" size={48} color={theme.background} />
          </TouchableOpacity>
          <Feather name="more-horizontal" size={24} color={theme.icon} style={styles.bottomMoreIcon} />
        </View>

        <MeditationTypeBottomSheet
          visible={showTypeSheet}
          onClose={() => setShowTypeSheet(false)}
          onSelect={setMeditationType}
          selectedType={meditationType}
        />
      </View>

      <Modal
        visible={showVolumeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVolumeModal(false)}
      >
        <TouchableOpacity
          style={styles.volumeModalOverlay}
          activeOpacity={1}
          onPress={() => setShowVolumeModal(false)}
        >
          <PanGestureHandler onGestureEvent={handleGestureEvent}>
            <View style={styles.volumeModalSheet} ref={modalSheetRef}>
              <View style={styles.volumeModalHandle} />
              <Text style={styles.volumeModalTitle}>Your device volume</Text>
              <Text style={styles.volumeModalPercent}>{Math.round(pendingDeviceVolume * 100)}%</Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={1}
                value={pendingDeviceVolume}
                onValueChange={setPendingDeviceVolume}
                minimumTrackTintColor={theme.accent}
                maximumTrackTintColor={theme.textSecondary}
                thumbTintColor={theme.accent}
              />
              <Text style={styles.volumeModalDesc}>Adjust individual items as a percentage of your device volume</Text>
              <View style={styles.volumeModalRow}>
                <Text style={styles.volumeModalLabel}>Starting bell</Text>
                <Text style={styles.volumeModalPercentSmall}>{Math.round(pendingStartBellVolume * 100)}%</Text>
                <TouchableOpacity onPress={() => playTestBell(pendingStartBellVolume * pendingDeviceVolume)}>
                  <Feather name="play-circle" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={1}
                value={pendingStartBellVolume}
                onValueChange={setPendingStartBellVolume}
                minimumTrackTintColor={theme.accent}
                maximumTrackTintColor={theme.textSecondary}
                thumbTintColor={theme.accent}
              />
              <Text style={[styles.volumeModalLabel, { opacity: 0.4, marginTop: 16 }]}>Interval bells</Text>
              <Text style={[styles.volumeModalLabel, { opacity: 0.4, marginTop: 16 }]}>Ambient sound</Text>
              <View style={styles.volumeModalRow}>
                <Text style={styles.volumeModalLabel}>Ending bell</Text>
                <Text style={styles.volumeModalPercentSmall}>{Math.round(pendingEndBellVolume * 100)}%</Text>
                <TouchableOpacity onPress={() => playTestBell(pendingEndBellVolume * pendingDeviceVolume)}>
                  <Feather name="play-circle" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={1}
                value={pendingEndBellVolume}
                onValueChange={setPendingEndBellVolume}
                minimumTrackTintColor={theme.accent}
                maximumTrackTintColor={theme.textSecondary}
                thumbTintColor={theme.accent}
              />
              <View style={styles.volumeModalActions}>
                <TouchableOpacity style={styles.volumeModalCancel} onPress={() => setShowVolumeModal(false)}>
                  <Text style={{ color: '#F44', fontSize: 18, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.volumeModalSave} onPress={() => {
                  setDeviceVolume(pendingDeviceVolume);
                  setStartBellVolume(pendingStartBellVolume);
                  setEndBellVolume(pendingEndBellVolume);
                  setShowVolumeModal(false);
                }}>
                  <Text style={{ color: '#F44', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </PanGestureHandler>
        </TouchableOpacity>
      </Modal>

      {/* Fullscreen Settings Panel, slides in from right */}
      {showSettings && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: theme.background,
            zIndex: 100,
            transform: [{ translateX: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }],
          }}
        >
          {/* Main settings screen */}
          {settingsScreen === 'main' && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 20, marginBottom: 24 }}>
                <TouchableOpacity onPress={closeSettings} accessibilityRole="button" accessibilityLabel="Close timer settings">
                  <Feather name="arrow-left" size={28} color={theme.icon} />
                </TouchableOpacity>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: 'bold', flex: 1, textAlign: 'center', marginRight: 28 }}>Timer settings</Text>
              </View>
              <View style={{ borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: 16 }} />
              <TouchableOpacity onPress={() => { subScreenAnim.setValue(1); openSubScreen('bell'); }} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 24 }}>
                <Text style={{ color: theme.text, fontSize: 18 }}>Bell strike interval</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 18 }}>{bellInterval.toFixed(1)}s</Text>
              </TouchableOpacity>
              <View style={{ borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: 16, marginHorizontal: 24 }} />
              <TouchableOpacity onPress={() => { subScreenAnim.setValue(1); openSubScreen('background'); }} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 }}>
                <Text style={{ color: theme.text, fontSize: 18 }}>Background{"\n"}Image</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 18 }}>{background}</Text>
              </TouchableOpacity>
            </>
          )}
          {/* Bell strike interval subscreen */}
          {settingsScreen === 'bell' && (
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: theme.background,
                zIndex: 101,
                transform: [{ translateX: subScreenAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 20, marginBottom: 24 }}>
                <TouchableOpacity onPress={closeSubScreen} accessibilityRole="button" accessibilityLabel="Back">
                  <Feather name="arrow-left" size={28} color={theme.icon} />
                </TouchableOpacity>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Bell strike interval</Text>
                <TouchableOpacity onPress={closeSubScreen} accessibilityRole="button" accessibilityLabel="Save" style={{ minWidth: 40 }}>
                  <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: theme.textSecondary, fontSize: 18, textAlign: 'center', marginBottom: 24 }}>Delay between multiple bell strikes:</Text>
              <Text style={{ color: theme.text, fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>{bellInterval.toFixed(1)} Seconds</Text>
              <Slider
                style={{ width: '90%', alignSelf: 'center', marginBottom: 32 }}
                minimumValue={1}
                maximumValue={10}
                step={0.1}
                value={bellInterval}
                onValueChange={setBellInterval}
                minimumTrackTintColor={theme.accent}
                maximumTrackTintColor={theme.textSecondary}
                thumbTintColor={theme.accent}
              />
              <TouchableOpacity onPress={() => {}} style={{ alignSelf: 'center', marginTop: 16 }}>
                <Text style={{ color: theme.text, fontSize: 20 }}>Play Sample</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          {/* Background image subscreen */}
          {settingsScreen === 'background' && (
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: theme.background,
                zIndex: 101,
                transform: [{ translateX: subScreenAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 20, marginBottom: 24 }}>
                <TouchableOpacity onPress={closeSubScreen} accessibilityRole="button" accessibilityLabel="Back">
                  <Feather name="arrow-left" size={28} color={theme.icon} />
                </TouchableOpacity>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Timer background</Text>
                <View style={{ minWidth: 40 }} />
              </View>
              {['Black', 'Ocean', 'Stars', 'Custom'].map((bg) => (
                <TouchableOpacity
                  key={bg}
                  onPress={() => setBackground(bg as any)}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 18 }}
                >
                  <Text style={{ color: theme.text, fontSize: 20 }}>{bg}</Text>
                  {background === bg && <Feather name="check" size={24} color={theme.accent} />}
                </TouchableOpacity>
              ))}
              <Text style={{ color: theme.textSecondary, fontSize: 16, marginTop: 16, paddingHorizontal: 24 }}>
                This is the background that you'll see when the timer is counting down.
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    justifyContent: 'flex-start',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 22,
    paddingHorizontal: 24,
    marginBottom: 0,
    position: 'relative',
  },
  tabWithUnderline: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
  },
  tabActive: {
    fontSize: 22,
    fontWeight: '700',
  },
  tabInactive: {
    fontSize: 22,
    fontWeight: '700',
    opacity: 0.5,
  },
  moreIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  bellSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  bellLabel: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  bellImage: {
    width: width * 0.45,
    height: width * 0.23,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  bellLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  bellLine: {
    height: 2,
    width: 48,
    opacity: 0.3,
  },
  bellNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
  },
  bellNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  bellName: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  settingsList: {
    marginTop: 12,
    marginBottom: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  settingsLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  settingsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 16,
    marginRight: 8,
  },
  newBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  revertBtn: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  revertText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomMoreIcon: {
    alignSelf: 'center',
    marginLeft: 24,
    marginRight: 4,
  },
  volumeModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  volumeModalSheet: {
    backgroundColor: '#181818',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
  },
  volumeModalHandle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#444',
    alignSelf: 'center',
    marginBottom: 16,
  },
  volumeModalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  volumeModalPercent: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  volumeModalDesc: {
    color: '#bbb',
    fontSize: 16,
    marginBottom: 16,
  },
  volumeModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  volumeModalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  volumeModalPercentSmall: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  volumeModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  volumeModalCancel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  volumeModalSave: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
});

export default TimerScreen; 