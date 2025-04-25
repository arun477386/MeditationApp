import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function for responsive font scaling
export function scaleFontSize(fontSize: number) {
  const baseWidth = 375; // Base width (iPhone SE)
  const scale = SCREEN_WIDTH / baseWidth;
  const clampedScale = Math.max(0.9, Math.min(scale, 1.2));
  return Math.round(fontSize * clampedScale);
}

// Typography sizes
export const typography = {
  // Headings
  h1: 36, // Large titles (was 40)
  h2: 24, // Section titles (was 28)
  h3: 20, // Subsection titles (was 24)
  
  // Body text
  bodyLarge: 16, // Primary content (was 18)
  bodyMedium: 14, // Regular content (was 16)
  bodySmall: 12, // Secondary content (was 14)
  
  // Special cases
  micro: 10, // Badges, timestamps (was 12)
  quote: 24, // Quote text (was 28)
  stats: 36, // Statistics numbers (was 42)
  
  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.8,
};

// Icon sizes
export const iconSizes = {
  tiny: 16,
  small: 20, // Small icons (was 24)
  medium: 22, // Navigation icons (was 24)
  large: 28, // Feature icons (was 32)
  xlarge: 32, // Special cases (was 36)
};

// UI Element sizes
export const elementSizes = {
  // Touch targets
  touchableMin: 36, // Minimum touchable area (was 40)
  iconButton: 36, // Icon button container (was 40)
  
  // Headers and bars
  topBarHeight: 52, // Top navigation bar (was 56)
  tabBarHeight: 48, // Bottom tab bar
  
  // Common components
  avatarSmall: 36, // Small avatar (was 40)
  avatarMedium: 44, // Medium avatar (was 48)
  avatarLarge: 56, // Large avatar (was 64)
  
  // Badges and indicators
  badge: 20, // Notification badge (was 24)
  indicator: 8, // Small indicators
  
  // Buttons
  buttonHeight: 44, // Standard button height (was 48)
  buttonBorderRadius: 8,
  
  // Cards
  cardBorderRadius: 12,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

// Export a complete theme object
export const theme = {
  typography,
  iconSizes,
  elementSizes,
  scaleFontSize,
};

export default theme; 