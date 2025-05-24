import 'styled-components/native';
import { Colors } from '@/constants/Colors';

type ThemeColors = typeof Colors.light;

declare module 'styled-components/native' {
  export interface DefaultTheme extends ThemeColors {}
} 