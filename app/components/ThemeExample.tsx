import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import theme, { typography, iconSizes, elementSizes } from '../theme/sizes';

export default function ThemeExample() {
  return (
    <View style={styles.container}>
      {/* Header Example */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="menu" size={iconSizes.medium} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Screen</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={iconSizes.medium} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content Example */}
      <View style={styles.content}>
        <Text style={styles.title}>Main Title</Text>
        <Text style={styles.subtitle}>Section Heading</Text>
        <Text style={styles.bodyText}>
          This is an example of body text using the new standardized sizes.
          All future screens should follow these size guidelines.
        </Text>

        {/* Button Example */}
        <TouchableOpacity style={styles.button}>
          <Feather 
            name="plus" 
            size={iconSizes.small} 
            color="#FFFFFF" 
            style={styles.buttonIcon} 
          />
          <Text style={styles.buttonText}>Action Button</Text>
        </TouchableOpacity>

        {/* Card Example */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather 
              name="star" 
              size={iconSizes.large} 
              color="#FFFFFF" 
            />
            <Text style={styles.cardTitle}>Feature Card</Text>
          </View>
          <Text style={styles.cardText}>
            Cards and other UI components maintain consistent spacing and sizing.
          </Text>
        </View>

        {/* Badge Example */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>New</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    height: elementSizes.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: elementSizes.spacing.md,
  },
  headerTitle: {
    fontSize: typography.h2,
    color: '#FFFFFF',
    fontWeight: '600',
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
  title: {
    fontSize: typography.h1,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: elementSizes.spacing.md,
  },
  subtitle: {
    fontSize: typography.h2,
    color: '#FFFFFF',
    marginBottom: elementSizes.spacing.sm,
  },
  bodyText: {
    fontSize: typography.bodyMedium,
    color: '#FFFFFF',
    lineHeight: typography.bodyMedium * typography.lineHeightNormal,
    marginBottom: elementSizes.spacing.lg,
  },
  button: {
    height: elementSizes.buttonHeight,
    backgroundColor: '#2ECC71',
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#2A2A2A',
    borderRadius: elementSizes.cardBorderRadius,
    padding: elementSizes.spacing.md,
    marginBottom: elementSizes.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: elementSizes.spacing.sm,
  },
  cardTitle: {
    fontSize: typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: elementSizes.spacing.sm,
  },
  cardText: {
    fontSize: typography.bodyMedium,
    color: '#AAAAAA',
    lineHeight: typography.bodyMedium * typography.lineHeightNormal,
  },
  badgeContainer: {
    backgroundColor: '#F4A62A',
    borderRadius: elementSizes.badge / 2,
    height: elementSizes.badge,
    paddingHorizontal: elementSizes.spacing.sm,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.micro,
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 