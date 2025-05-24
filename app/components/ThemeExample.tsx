import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import theme, { typography, iconSizes, elementSizes } from '../theme/sizes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function ThemeExample() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      {/* Header Example */}
      <View style={[styles.header, { backgroundColor: themeColors.background }]}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="menu" size={iconSizes.medium} color={themeColors.text} />
        </TouchableOpacity>
        <ThemedText type="title">New Screen</ThemedText>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={iconSizes.medium} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      {/* Content Example */}
      <View style={styles.content}>
        <ThemedText type="title">Main Title</ThemedText>
        <ThemedText type="subtitle">Section Heading</ThemedText>
        <ThemedText>
          This is an example of body text using the new standardized sizes.
          All future screens should follow these size guidelines.
        </ThemedText>

        {/* Button Example */}
        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.accent }]}>
          <Feather 
            name="plus" 
            size={iconSizes.small} 
            color={themeColors.text} 
            style={styles.buttonIcon} 
          />
          <ThemedText style={styles.buttonText}>Action Button</ThemedText>
        </TouchableOpacity>

        {/* Card Example */}
        <View style={[styles.card, { backgroundColor: themeColors.card }]}>
          <View style={styles.cardHeader}>
            <Feather 
              name="star" 
              size={iconSizes.large} 
              color={themeColors.text} 
            />
            <ThemedText type="subtitle">Feature Card</ThemedText>
          </View>
          <ThemedText style={{ color: themeColors.textSecondary }}>
            Cards and other UI components maintain consistent spacing and sizing.
          </ThemedText>
        </View>

        {/* Badge Example */}
        <View style={[styles.badgeContainer, { backgroundColor: themeColors.plus }]}>
          <ThemedText style={styles.badgeText}>New</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: elementSizes.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: elementSizes.spacing.md,
  },
  iconButton: {
    width: elementSizes.iconButton,
    height: elementSizes.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: elementSizes.spacing.md,
  },
  button: {
    height: elementSizes.buttonHeight,
    borderRadius: elementSizes.buttonBorderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: elementSizes.spacing.md,
    marginBottom: elementSizes.spacing.lg,
  },
  buttonIcon: {
    marginRight: elementSizes.spacing.sm,
  },
  buttonText: {
    fontSize: typography.bodyMedium,
    fontWeight: '600',
  },
  card: {
    borderRadius: elementSizes.cardBorderRadius,
    padding: elementSizes.spacing.md,
    marginBottom: elementSizes.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: elementSizes.spacing.sm,
  },
  badgeContainer: {
    borderRadius: elementSizes.badge / 2,
    height: elementSizes.badge,
    paddingHorizontal: elementSizes.spacing.sm,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.micro,
    fontWeight: '600',
  },
}); 