import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Colors } from '@/constants/Colors';

interface ImageProps {
  source: { uri: string };
  style?: any;
  contentFit?: 'cover' | 'contain' | 'fill';
  transition?: number;
  fallbackSource?: { uri: string };
}

export function Image({ 
  source, 
  style, 
  contentFit = 'cover',
  transition = 200,
  fallbackSource = { uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, style]}>
      <ExpoImage
        source={hasError ? fallbackSource : source}
        style={styles.image}
        contentFit={contentFit}
        transition={transition}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {isLoading && (
        <View style={[styles.overlay, style]}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 