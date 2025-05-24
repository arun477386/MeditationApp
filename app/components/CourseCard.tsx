import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../theme/sizes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from '@/components/ui/Image';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity 
      style={[styles.container, { paddingBottom: insets.bottom }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={`Course: ${title} by ${instructor}`}
      accessibilityRole="button"
    >
      <View style={[styles.card, { backgroundColor: theme.card }]}> 
        <Image
          source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={[styles.playButton, { backgroundColor: theme.icon + '33' }]}> 
          <Ionicons name="play" size={20} color={theme.background} />
        </View>
      </View>
      
      <View style={styles.info}>
        {(rating || duration || type) && (
          <View style={styles.metaRow}>
            {rating && <Text style={[styles.rating, { color: theme.text }]}>{rating}★</Text>}
            {type && <Text style={[styles.meta, { color: theme.textSecondary }]}>{type}</Text>}
            {duration && <Text style={[styles.meta, { color: theme.textSecondary }]}>· {duration} days</Text>}
            {isPlus && (
              <View style={[styles.plusBadge, { backgroundColor: theme.plus }]}> 
                <Text style={[styles.plusBadgeText, { color: theme.background }]}>Plus</Text>
              </View>
            )}
          </View>
        )}
        
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.instructor, { color: theme.textSecondary }]}>{instructor}</Text>
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
    marginRight: 6,
  },
  meta: {
    fontSize: typography.bodySmall,
  },
  plusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  plusBadgeText: {
    fontSize: typography.micro,
    fontWeight: '600',
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: typography.h3 * typography.lineHeightTight,
  },
  instructor: {
    fontSize: typography.bodyMedium,
  },
});

export const MemoizedCourseCard = memo(CourseCard);

export default MemoizedCourseCard; 