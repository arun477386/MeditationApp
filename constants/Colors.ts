/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

/**
 * Theme colors for the app. These colors are used throughout the app and support both light and dark modes.
 */

export const Colors = {
  light: {
    // Primary colors
    primary: '#222222', // Near-black for headings
    accent: '#17998C',  // Teal/green accent
    plus: '#F4A62A',    // Orange
    
    // Background colors
    background: '#FFFFFF',      // Pure white
    surface: '#F7F7F7',        // Very light gray for surfaces
    card: '#F7F7F7',           // Card/tile backgrounds
    cardBackground: '#FFFFFF', // Card backgrounds (white)
    
    // Text colors
    text: '#222222',           // Main text (black)
    textSecondary: '#666666',  // Secondary text (medium gray)
    icon: '#222222',           // Icons (black)
    
    // UI elements
    border: '#E0E0E0',         // Light border
    tabIconDefault: '#666666', // Inactive tab icon
    tabIconSelected: '#222222',// Active tab icon
    tint: '#17998C',           // Accent tint
  },
  dark: {
    // Primary colors
    primary: '#F4F4F4',        // Near-white for headings
    accent: '#17998C',         // Teal/green accent
    plus: '#F4A62A',           // Orange
    
    // Background colors
    background: '#181818',     // Pure black/dark gray
    surface: '#232323',        // Card/tile backgrounds
    card: '#232323',           // Card/tile backgrounds
    cardBackground: '#181818', // Card backgrounds (dark)
    
    // Text colors
    text: '#F4F4F4',           // Main text (white)
    textSecondary: '#BBBBBB',  // Secondary text (light gray)
    icon: '#F4F4F4',           // Icons (white)
    
    // UI elements
    border: '#232323',         // Dark border
    tabIconDefault: '#BBBBBB', // Inactive tab icon
    tabIconSelected: '#F4F4F4',// Active tab icon
    tint: '#17998C',           // Accent tint
  },
};
