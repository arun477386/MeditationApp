import React from 'react';
import { Platform, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

// Define types for MapView and Marker
type MapViewType = any;
type MarkerType = any;

let MapView: MapViewType;
let Marker: MarkerType;

// if (Platform.OS !== 'web') {
//   const maps = require('react-native-maps');
//   MapView = maps.default;
//   Marker = maps.Marker;
// }

interface CrossPlatformMapViewProps {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  onPress: () => void;
}

export default function CrossPlatformMapView({ coordinates, title, onPress }: CrossPlatformMapViewProps) {
  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity style={styles.fallback} onPress={onPress}>
        <Text style={styles.text}>Tap to open in Google Maps</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.mapContainer} onPress={onPress}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pointerEvents="none"
      >
        <Marker coordinate={coordinates} title={title} />
      </MapView>
      <View style={styles.overlay}>
        <Text style={styles.text}>Tap to open in Maps</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  fallback: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
}); 