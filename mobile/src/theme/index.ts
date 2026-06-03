export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#E9ECEF',
    primary: '#FF4B3A', // Vibrant food-app tomato red/orange
    primaryDark: '#D63022',
    primaryLight: '#FFEBEA',
    secondary: '#FFC72C', // Golden yellow
    text: '#1A1D20',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    border: '#DEE2E6',
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.05)',
    success: '#2EC4B6',
    warning: '#FF9F1C',
    error: '#E71D36',
    info: '#011627',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    primary: '#FF5C4D',
    primaryDark: '#FF4B3A',
    primaryLight: '#3D1A16',
    secondary: '#FFD452',
    text: '#F8F9FA',
    textSecondary: '#A0AAB2',
    textMuted: '#6C757D',
    border: '#2D2D2D',
    card: '#1E1E1E',
    shadow: 'rgba(0, 0, 0, 0.3)',
    success: '#33D1C4',
    warning: '#FFAA33',
    error: '#FF3B50',
    info: '#FFFFFF',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  fontFamily: {
    regular: 'System',
    mono: 'SpaceMono',
  },
};
