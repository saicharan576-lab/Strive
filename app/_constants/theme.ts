export const UI_CONSTANTS = {
  STAR_SIZE: 16,
  ICON_SIZE: 24,
  AVATAR_SIZE: 48,
  BORDER_RADIUS: 8,
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  ANIMATION: {
    DURATION: 300,
  }
} as const;

export const colors = {
  primary: '#14B8A6',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    white: '#FFFFFF',
  },
  background: {
    white: '#FFFFFF',
    gray: '#F9FAFB',
    lightGray: '#F3F4F6',
    card: '#FFFFFF',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
  },
  star: {
    filled: '#FBBF24',
    empty: '#E5E7EB',
  },
  badge: {
    purple: {
      background: '#F3E8FF',
      text: '#A855F7',
    }
  }
} as const;

export type Colors = typeof colors;