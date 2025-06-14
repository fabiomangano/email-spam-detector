import { createTheme, rem } from '@mantine/core';
import { tokens } from './tokens';

export const theme = createTheme({
  // Font Family - Modern dashboard fonts
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, "Fira Code", Consolas, Monaco, monospace',
  
  // Font Sizes - Compact dashboard scale
  fontSizes: {
    xs: rem(11),   // Small labels, badges
    sm: rem(12),   // Body text, descriptions
    md: rem(14),   // Primary text
    lg: rem(16),   // Emphasis text
    xl: rem(18),   // Large emphasis
  },

  // Line Heights - Optimized for readability
  lineHeights: {
    xs: '1.3',
    sm: '1.4', 
    md: '1.5',
    lg: '1.6',
    xl: '1.7',
  },

  // Spacing - 4px base scale for dashboard consistency
  spacing: {
    xs: rem(4),    // Tight spacing
    sm: rem(8),    // Close elements  
    md: rem(16),   // Standard spacing
    lg: rem(24),   // Section spacing
    xl: rem(40),   // Large gaps
  },

  // Border Radius - Modern subtle curves
  radius: {
    xs: rem(3),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  // Shadows - Subtle depth for modern dashboards
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  // Colors - Security-focused dashboard palette
  colors: {
    // Neutral grays for dashboard
    gray: [
      '#fafafa',  // 0 - lightest background
      '#f5f5f5',  // 1 - light background  
      '#e5e5e5',  // 2 - subtle borders
      '#d4d4d4',  // 3 - borders
      '#a3a3a3',  // 4 - disabled text
      '#737373',  // 5 - secondary text
      '#525252',  // 6 - body text
      '#404040',  // 7 - headings
      '#262626',  // 8 - strong headings
      '#171717',  // 9 - darkest text
    ],
    // Primary brand - Security blue
    blue: [
      '#eff6ff',  // 0 - very light
      '#dbeafe',  // 1 - light
      '#bfdbfe',  // 2 - 
      '#93c5fd',  // 3 - 
      '#60a5fa',  // 4 - 
      '#3b82f6',  // 5 - primary
      '#2563eb',  // 6 - 
      '#1d4ed8',  // 7 - 
      '#1e40af',  // 8 - 
      '#1e3a8a',  // 9 - darkest
    ],
    // Security status colors
    green: [
      '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
      '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'  // Safe/Low risk
    ],
    yellow: [
      '#fefce8', '#fef3c7', '#fde68a', '#facc15', '#eab308',
      '#ca8a04', '#a16207', '#854d0e', '#713f12', '#422006'  // Medium risk
    ],
    red: [
      '#fef2f2', '#fecaca', '#fca5a5', '#f87171', '#ef4444',
      '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a'  // High risk/Danger
    ],
    // Accent color for emphasis
    indigo: [
      '#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8',
      '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'  // Analytics/Info
    ],
  },

  // Primary Color
  primaryColor: 'blue',

  // Default Radius
  defaultRadius: 'md',

  // Headings - Dashboard hierarchy with appropriate weights
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      h1: {
        fontSize: rem(24),     // Page title
        lineHeight: '1.3',
        fontWeight: '700',     // Bold for main page titles
      },
      h2: {
        fontSize: rem(20),     // Section title
        lineHeight: '1.3', 
        fontWeight: '600',     // Semi-bold for sections
      },
      h3: {
        fontSize: rem(16),     // Card/component title
        lineHeight: '1.4',
        fontWeight: '600',     // Semi-bold for card titles
      },
      h4: {
        fontSize: rem(14),     // Sub-section
        lineHeight: '1.4',
        fontWeight: '500',     // Medium for subsections
      },
      h5: {
        fontSize: rem(12),     // Small labels
        lineHeight: '1.4', 
        fontWeight: '500',     // Medium for labels
      },
      h6: {
        fontSize: rem(11),     // Tiny labels/metadata
        lineHeight: '1.4',
        fontWeight: '500',     // Medium for metadata
      },
    },
  },

  // Components - Dashboard optimized
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
      styles: {
        root: {
          fontWeight: '500',
          fontSize: rem(13),
          transition: 'all 0.15s ease-in-out',
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
        padding: 'md',
      },
      styles: {
        root: {
          border: '1px solid #e5e5e5',
          backgroundColor: '#ffffff',
        },
      },
    },

    Text: {
      defaultProps: {
        size: 'sm',
      },
      styles: {
        root: {
          lineHeight: '1.4',
          color: '#525252',
        },
      },
    },

    Title: {
      styles: {
        root: {
          letterSpacing: '-0.01em',
          color: '#262626',
        },
      },
    },

    Badge: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
      styles: {
        root: {
          fontSize: rem(11),
          fontWeight: '500',
        },
      },
    },

    Alert: {
      defaultProps: {
        radius: 'md',
      },
    },

    Input: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    },

    TextInput: {
      defaultProps: {
        size: 'sm', 
        radius: 'sm',
      },
    },

    Textarea: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
      styles: {
        input: {
          fontSize: rem(13),
          lineHeight: '1.4',
        },
      },
    },

    Tabs: {
      defaultProps: {
        radius: 'sm',
      },
    },

    Progress: {
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    },

    NavLink: {
      styles: {
        root: {
          fontSize: rem(13),
          fontWeight: '500',
        },
      },
    },
  },
});