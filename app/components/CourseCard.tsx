import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../theme/sizes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from '@/components/ui/Image';

interface CourseCardProps {
  title: string;
  instructor: string;
  rating?: number;
  duration?: number;
  isPlus?: boolean;
  imageUrl?: string;
  type?: string;
  onPress?: () => void;
}

export function CourseCard({
  title,
  instructor,
  rating,
  duration,
  isPlus,
  imageUrl,
  type,
  onPress,
}: CourseCardProps) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity 
      style={[styles.container, { paddingBottom: insets.bottom }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={`Course: ${title} by ${instructor}`}
      accessibilityRole="button"
    >
      <View style={styles.card}>
        <Image
          source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.playButton}>
          <Ionicons name="play" size={20} color="#FFFFFF" />
        </View>
      </View>
      
      <View style={styles.info}>
        {(rating || duration || type) && (
          <View style={styles.metaRow}>
            {rating && <Text style={styles.rating}>{rating}★</Text>}
            {type && <Text style={styles.meta}>{type}</Text>}
            {duration && <Text style={styles.meta}>· {duration} days</Text>}
            {isPlus && (
              <View style={styles.plusBadge}>
                <Text style={styles.plusBadgeText}>Plus</Text>
              </View>
            )}
          </View>
        )}
        
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.instructor}>{instructor}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 16,
  },
  card: {
    width: '100%',
    height: 160,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -22 }, { translateY: -22 }],
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    fontSize: typography.bodySmall,
    color: '#FFFFFF',
    marginRight: 6,
  },
  meta: {
    fontSize: typography.bodySmall,
    color: '#AAAAAA',
  },
  plusBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  plusBadgeText: {
    fontSize: typography.micro,
    color: '#000000',
    fontWeight: '600',
  },
  title: {
    fontSize: typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: typography.h3 * typography.lineHeightTight,
  },
  instructor: {
    fontSize: typography.bodyMedium,
    color: '#AAAAAA',
  },
});

export const MemoizedCourseCard = memo(CourseCard);

export default MemoizedCourseCard; 