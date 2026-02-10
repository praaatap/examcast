// ─── Color Palette ───────────────────────────────────────────────────────────

export const Colors = {
  // Primary
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#3B82F6',
  primaryGlow: 'rgba(37, 99, 235, 0.25)',

  // Secondary
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',

  // Surfaces
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  surfaceGlass: 'rgba(30, 41, 59, 0.75)',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Semantic
  danger: '#EF4444',
  dangerDark: '#DC2626',
  warning: '#F59E0B',
  warningDark: '#D97706',
  success: '#10B981',
  successDark: '#059669',
  info: '#3B82F6',
};

// ─── Gradients ───────────────────────────────────────────────────────────────

export const Gradients = {
  primary: ['#2563EB', '#1E40AF'] as const,
  secondary: ['#10B981', '#059669'] as const,
  accent: ['#6366F1', '#2563EB'] as const,
  danger: ['#EF4444', '#DC2626'] as const,
  surface: ['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.9)'] as const,
  glow: ['rgba(37, 99, 235, 0.4)', 'rgba(99, 102, 241, 0.1)', 'transparent'] as const,
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radius ───────────────────────────────────────────────────────────

export const BorderRadius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  full: 9999,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string = Colors.primary) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// ─── Animation ───────────────────────────────────────────────────────────────

export const AnimationDuration = {
  fast: 150,
  medium: 300,
  slow: 500,
  pulse: 2000,
};
