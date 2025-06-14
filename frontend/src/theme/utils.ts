import { tokens } from './tokens';

// Utility functions per uso comune dei design tokens

export const spacing = {
  // Padding utilities
  p: (size: keyof typeof tokens.spacing) => ({ padding: tokens.spacing[size] }),
  px: (size: keyof typeof tokens.spacing) => ({ 
    paddingLeft: tokens.spacing[size], 
    paddingRight: tokens.spacing[size] 
  }),
  py: (size: keyof typeof tokens.spacing) => ({ 
    paddingTop: tokens.spacing[size], 
    paddingBottom: tokens.spacing[size] 
  }),
  pt: (size: keyof typeof tokens.spacing) => ({ paddingTop: tokens.spacing[size] }),
  pb: (size: keyof typeof tokens.spacing) => ({ paddingBottom: tokens.spacing[size] }),
  pl: (size: keyof typeof tokens.spacing) => ({ paddingLeft: tokens.spacing[size] }),
  pr: (size: keyof typeof tokens.spacing) => ({ paddingRight: tokens.spacing[size] }),

  // Margin utilities
  m: (size: keyof typeof tokens.spacing) => ({ margin: tokens.spacing[size] }),
  mx: (size: keyof typeof tokens.spacing) => ({ 
    marginLeft: tokens.spacing[size], 
    marginRight: tokens.spacing[size] 
  }),
  my: (size: keyof typeof tokens.spacing) => ({ 
    marginTop: tokens.spacing[size], 
    marginBottom: tokens.spacing[size] 
  }),
  mt: (size: keyof typeof tokens.spacing) => ({ marginTop: tokens.spacing[size] }),
  mb: (size: keyof typeof tokens.spacing) => ({ marginBottom: tokens.spacing[size] }),
  ml: (size: keyof typeof tokens.spacing) => ({ marginLeft: tokens.spacing[size] }),
  mr: (size: keyof typeof tokens.spacing) => ({ marginRight: tokens.spacing[size] }),

  // Gap utilities
  gap: (size: keyof typeof tokens.spacing) => ({ gap: tokens.spacing[size] }),
};

export const typography = {
  // Font family utilities
  fontSans: { fontFamily: tokens.typography.fontFamily.sans.join(', ') },
  fontMono: { fontFamily: tokens.typography.fontFamily.mono.join(', ') },

  // Font size utilities
  text: (size: keyof typeof tokens.typography.fontSize) => ({
    fontSize: tokens.typography.fontSize[size],
  }),

  // Font weight utilities
  font: (weight: keyof typeof tokens.typography.fontWeight) => ({
    fontWeight: tokens.typography.fontWeight[weight],
  }),

  // Line height utilities
  leading: (height: keyof typeof tokens.typography.lineHeight) => ({
    lineHeight: tokens.typography.lineHeight[height],
  }),

  // Letter spacing utilities
  tracking: {
    tighter: { letterSpacing: '-0.05em' },
    tight: { letterSpacing: '-0.025em' },
    normal: { letterSpacing: '0' },
    wide: { letterSpacing: '0.025em' },
    wider: { letterSpacing: '0.05em' },
    widest: { letterSpacing: '0.1em' },
  },
};

export const colors = {
  // Semantic color utilities
  text: {
    primary: tokens.colors.gray[900],
    secondary: tokens.colors.gray[700],
    muted: tokens.colors.gray[500],
    disabled: tokens.colors.gray[400],
  },
  
  bg: {
    primary: '#ffffff',
    secondary: tokens.colors.gray[50],
    muted: tokens.colors.gray[100],
  },

  border: {
    default: tokens.colors.gray[200],
    muted: tokens.colors.gray[100],
    strong: tokens.colors.gray[300],
  },

  // Security risk colors
  risk: {
    low: tokens.colors.security.low,
    medium: tokens.colors.security.medium,
    high: tokens.colors.security.high,
    critical: tokens.colors.security.critical,
  },
};

export const effects = {
  // Shadow utilities
  shadow: (size: keyof typeof tokens.shadows) => ({
    boxShadow: tokens.shadows[size],
  }),

  // Border radius utilities
  rounded: (size: keyof typeof tokens.borderRadius) => ({
    borderRadius: tokens.borderRadius[size],
  }),

  // Transition utilities
  transition: (property = 'all', duration: keyof typeof tokens.transitions.duration = 'normal') => ({
    transition: `${property} ${tokens.transitions.duration[duration]} ${tokens.transitions.easing.inOut}`,
  }),
};

// Composite utilities per combinazioni comuni
export const card = {
  base: {
    backgroundColor: colors.bg.primary,
    borderRadius: tokens.borderRadius.lg,
    boxShadow: tokens.shadows.sm,
    border: `1px solid ${colors.border.default}`,
    ...effects.transition(),
  },
  interactive: {
    '&:hover': {
      boxShadow: tokens.shadows.md,
      borderColor: colors.border.strong,
    },
  },
};

export const button = {
  base: {
    borderRadius: tokens.borderRadius.md,
    fontWeight: tokens.typography.fontWeight.medium,
    ...effects.transition(),
  },
};

export const input = {
  base: {
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${colors.border.default}`,
    fontSize: tokens.typography.fontSize.sm,
    ...effects.transition('border-color'),
    '&:focus': {
      borderColor: tokens.colors.primary[500],
      boxShadow: `0 0 0 3px ${tokens.colors.primary[100]}`,
    },
  },
};