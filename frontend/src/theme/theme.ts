import { createTheme, rem } from '@mantine/core';
import { tokens } from './tokens';

export const theme = createTheme({
  // Font Family
  fontFamily: tokens.typography.fontFamily.sans.join(', '),
  fontFamilyMonospace: tokens.typography.fontFamily.mono.join(', '),
  
  // Font Sizes (convertiti in rem)
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },

  // Line Heights
  lineHeights: {
    xs: '1.2',
    sm: '1.35',
    md: '1.5',
    lg: '1.6',
    xl: '1.75',
  },

  // Spacing (convertito in rem)
  spacing: {
    xs: rem(8),   // tokens.spacing[2]
    sm: rem(12),  // tokens.spacing[3]
    md: rem(16),  // tokens.spacing[4]
    lg: rem(20),  // tokens.spacing[5]
    xl: rem(24),  // tokens.spacing[6]
  },

  // Border Radius
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  // Shadows
  shadows: {
    xs: tokens.shadows.sm,
    sm: tokens.shadows.base,
    md: tokens.shadows.md,
    lg: tokens.shadows.lg,
    xl: tokens.shadows.xl,
  },

  // Colors (usando i nostri token)
  colors: {
    // Brand primary
    blue: [
      tokens.colors.primary[50],
      tokens.colors.primary[100],
      tokens.colors.primary[200],
      tokens.colors.primary[300],
      tokens.colors.primary[400],
      tokens.colors.primary[500],
      tokens.colors.primary[600],
      tokens.colors.primary[700],
      tokens.colors.primary[800],
      tokens.colors.primary[900],
    ],
    // Security colors
    green: [
      '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
      tokens.colors.security.low, '#16a34a', '#15803d', '#166534', '#14532d'
    ],
    yellow: [
      '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24',
      tokens.colors.security.medium, '#d97706', '#b45309', '#92400e', '#78350f'
    ],
    red: [
      '#fef2f2', '#fecaca', '#fca5a5', '#f87171', '#ef4444',
      tokens.colors.security.high, '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'
    ],
  },

  // Primary Color
  primaryColor: 'blue',

  // Default Radius
  defaultRadius: 'md',

  // Headings
  headings: {
    fontFamily: tokens.typography.fontFamily.sans.join(', '),
    fontWeight: String(tokens.typography.fontWeight.bold),
    sizes: {
      h1: {
        fontSize: rem(36),
        lineHeight: '1.2',
        fontWeight: String(tokens.typography.fontWeight.extrabold),
      },
      h2: {
        fontSize: rem(30),
        lineHeight: '1.2',
        fontWeight: String(tokens.typography.fontWeight.bold),
      },
      h3: {
        fontSize: rem(24),
        lineHeight: '1.3',
        fontWeight: String(tokens.typography.fontWeight.bold),
      },
      h4: {
        fontSize: rem(20),
        lineHeight: '1.4',
        fontWeight: String(tokens.typography.fontWeight.semibold),
      },
      h5: {
        fontSize: rem(18),
        lineHeight: '1.4',
        fontWeight: String(tokens.typography.fontWeight.semibold),
      },
      h6: {
        fontSize: rem(16),
        lineHeight: '1.4',
        fontWeight: String(tokens.typography.fontWeight.medium),
      },
    },
  },

  // Components personalizzati
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: tokens.typography.fontWeight.medium,
          transition: `all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.inOut}`,
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
      styles: {
        root: {
          border: `1px solid ${tokens.colors.gray[200]}`,
        },
      },
    },

    Text: {
      styles: {
        root: {
          lineHeight: tokens.typography.lineHeight.normal,
        },
      },
    },

    Title: {
      styles: {
        root: {
          letterSpacing: '-0.025em', // tight letter spacing per i titoli
        },
      },
    },

    Container: {
      defaultProps: {
        sizes: {
          xs: rem(540),
          sm: rem(720),
          md: rem(960),
          lg: rem(1140),
          xl: rem(1320),
        },
      },
    },

    Tabs: {
      defaultProps: {
        radius: 'md',
      },
    },

    Badge: {
      defaultProps: {
        radius: 'md',
      },
    },

    Alert: {
      defaultProps: {
        radius: 'md',
      },
    },

    Textarea: {
      styles: {
        input: {
          fontSize: rem(14),
          lineHeight: tokens.typography.lineHeight.normal,
        },
      },
    },

    Stepper: {
      styles: {
        stepDescription: {
          fontSize: rem(14),
          color: tokens.colors.gray[600],
        },
      },
    },
  },
});