import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  // Font Family - Modern design
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, "Fira Code", Consolas, Monaco, monospace',
  
  // Font Sizes
  fontSizes: {
    xs: rem(11),
    sm: rem(12),
    md: rem(14),
    lg: rem(16),
    xl: rem(18),
  },

  // Line Heights
  lineHeights: {
    xs: '1.3',
    sm: '1.4', 
    md: '1.5',
    lg: '1.6',
    xl: '1.7',
  },

  // Spacing
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(40),
  },

  // Border Radius
  radius: {
    xs: rem(3),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0, 0, 0, 0.10)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.08)',
  },

  // Colors - Black, White, Gray, Red, Green, Yellow
  colors: {
    // Grayscale palette
    gray: [
      '#ffffff',  // 0 - pure white
      '#fafafa',  // 1 - lightest gray
      '#f5f5f5',  // 2 - very light gray  
      '#e5e5e5',  // 3 - light gray
      '#d4d4d4',  // 4 - medium light gray
      '#a3a3a3',  // 5 - medium gray
      '#737373',  // 6 - dark gray
      '#525252',  // 7 - darker gray
      '#404040',  // 8 - very dark gray
      '#262626',  // 9 - near black
    ],
    // Dark theme variations
    dark: [
      '#ffffff',  // 0 - white
      '#f8f9fa',  // 1 - 
      '#e9ecef',  // 2 - 
      '#dee2e6',  // 3 - 
      '#ced4da',  // 4 - 
      '#adb5bd',  // 5 - 
      '#6c757d',  // 6 - 
      '#495057',  // 7 - 
      '#343a40',  // 8 - 
      '#212529',  // 9 - near black
    ],
    // Green palette
    green: [
      '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
      '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'
    ],
    // Yellow palette  
    yellow: [
      '#fefce8', '#fef3c7', '#fde68a', '#facc15', '#eab308',
      '#ca8a04', '#a16207', '#92400e', '#78350f', '#451a03'
    ],
    // Red palette
    red: [
      '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171',
      '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'
    ],
    // Blue palette (keeping for system use)
    blue: [
      '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8',
      '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'
    ],
    // Orange palette (keeping for system use)
    orange: [
      '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c',
      '#f97316', '#ea580c', '#dc2626', '#c2410c', '#9a3412'
    ],
  },

  // Primary Color
  primaryColor: 'dark',

  // Default Radius
  defaultRadius: 'md',

  // Headings
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      h1: {
        fontSize: rem(24),
        lineHeight: '1.3',
        fontWeight: '700',
      },
      h2: {
        fontSize: rem(20),
        lineHeight: '1.3', 
        fontWeight: '600',
      },
      h3: {
        fontSize: rem(16),
        lineHeight: '1.4',
        fontWeight: '600',
      },
      h4: {
        fontSize: rem(14),
        lineHeight: '1.4',
        fontWeight: '500',
      },
      h5: {
        fontSize: rem(12),
        lineHeight: '1.4', 
        fontWeight: '500',
      },
      h6: {
        fontSize: rem(11),
        lineHeight: '1.4',
        fontWeight: '500',
      },
    },
  },

  // Components
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: '500',
          fontSize: rem(13),
          transition: 'all 0.2s ease-in-out',
          border: '1px solid transparent',
        },
      },
      variants: {
        filled: (theme, props) => {
          const colors = {
            gray: { bg: '#262626', color: '#ffffff', hover: '#404040' },
            red: { bg: '#ef4444', color: '#ffffff', hover: '#dc2626' },
            green: { bg: '#22c55e', color: '#ffffff', hover: '#16a34a' },
            yellow: { bg: '#eab308', color: '#000000', hover: '#ca8a04' },
            blue: { bg: '#0ea5e9', color: '#ffffff', hover: '#0284c7' },
            dark: { bg: '#262626', color: '#ffffff', hover: '#404040' },
          };
          const colorData = colors[props.color] || colors.dark;
          
          return {
            root: {
              backgroundColor: colorData.bg,
              color: colorData.color,
              border: `1px solid ${colorData.bg}`,
              '&:hover': {
                backgroundColor: colorData.hover,
                border: `1px solid ${colorData.hover}`,
              },
            },
          };
        },
        outline: (theme, props) => {
          const colors = {
            gray: { border: '#262626', color: '#262626', hover: '#f5f5f5' },
            red: { border: '#ef4444', color: '#ef4444', hover: '#fef2f2' },
            green: { border: '#22c55e', color: '#22c55e', hover: '#f0fdf4' },
            yellow: { border: '#eab308', color: '#eab308', hover: '#fefce8' },
            blue: { border: '#0ea5e9', color: '#0ea5e9', hover: '#f0f9ff' },
            dark: { border: '#262626', color: '#262626', hover: '#f5f5f5' },
          };
          const colorData = colors[props.color] || colors.dark;
          
          return {
            root: {
              backgroundColor: 'transparent',
              color: colorData.color,
              border: `1px solid ${colorData.border}`,
              '&:hover': {
                backgroundColor: colorData.hover,
                border: `1px solid ${colorData.border}`,
              },
            },
          };
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
        padding: 'lg',
      },
      styles: {
        root: {
          border: '1px solid #e5e5e5',
          backgroundColor: '#ffffff',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            shadow: 'md',
            borderColor: '#d4d4d4',
          },
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
        variant: 'light',
      },
      styles: {
        root: {
          fontSize: rem(11),
          fontWeight: '500',
        },
      },
      variants: {
        light: (theme, props) => {
          const colors = {
            gray: { bg: '#f5f5f5', color: '#525252', border: '#e5e5e5' },
            red: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
            green: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
            yellow: { bg: '#fefce8', color: '#a16207', border: '#fde68a' },
            blue: { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
            orange: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
          };
          const colorData = colors[props.color] || colors.gray;
          
          return {
            root: {
              backgroundColor: colorData.bg,
              color: colorData.color,
              border: `1px solid ${colorData.border}`,
            },
          };
        },
        filled: (theme, props) => {
          const colors = {
            gray: { bg: '#262626', color: '#ffffff' },
            red: { bg: '#ef4444', color: '#ffffff' },
            green: { bg: '#22c55e', color: '#ffffff' },
            yellow: { bg: '#eab308', color: '#000000' },
            blue: { bg: '#0ea5e9', color: '#ffffff' },
            orange: { bg: '#f97316', color: '#ffffff' },
          };
          const colorData = colors[props.color] || colors.gray;
          
          return {
            root: {
              backgroundColor: colorData.bg,
              color: colorData.color,
            },
          };
        },
        outline: (theme, props) => {
          const colors = {
            gray: { border: '#262626', color: '#262626' },
            red: { border: '#ef4444', color: '#ef4444' },
            green: { border: '#22c55e', color: '#22c55e' },
            yellow: { border: '#eab308', color: '#eab308' },
            blue: { border: '#0ea5e9', color: '#0ea5e9' },
            orange: { border: '#f97316', color: '#f97316' },
          };
          const colorData = colors[props.color] || colors.gray;
          
          return {
            root: {
              backgroundColor: 'transparent',
              color: colorData.color,
              border: `1px solid ${colorData.border}`,
            },
          };
        },
      },
    },

    Alert: {
      defaultProps: {
        radius: 'md',
        variant: 'light',
      },
      styles: (theme, props) => {
        const colors = {
          red: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
          green: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
          yellow: { bg: '#fefce8', border: '#fde68a', color: '#a16207' },
          blue: { bg: '#f0f9ff', border: '#bae6fd', color: '#0284c7' },
          gray: { bg: '#f5f5f5', border: '#e5e5e5', color: '#525252' },
        };
        const colorData = colors[props.color] || colors.gray;
        
        return {
          root: {
            backgroundColor: colorData.bg,
            border: `1px solid ${colorData.border}`,
            color: colorData.color,
          },
        };
      },
    },

    Input: {
      defaultProps: {
        size: 'sm',
        radius: 'md',
      },
      styles: {
        input: {
          border: '1px solid #d4d4d4',
          '&:focus': {
            borderColor: '#262626',
          },
        },
      },
    },

    Textarea: {
      defaultProps: {
        size: 'sm',
        radius: 'md',
      },
      styles: {
        input: {
          fontSize: rem(13),
          lineHeight: '1.4',
          border: '1px solid #d4d4d4',
          '&:focus': {
            borderColor: '#262626',
          },
        },
      },
    },

    Progress: {
      defaultProps: {
        size: 'sm',
        radius: 'md',
      },
      styles: (theme, props) => {
        const colors = {
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#0ea5e9',
          gray: '#525252',
        };
        
        return {
          root: {
            backgroundColor: '#f5f5f5',
          },
          bar: {
            backgroundColor: colors[props.color] || colors.gray,
          },
        };
      },
    },

    NavLink: {
      styles: {
        root: {
          fontSize: rem(13),
          fontWeight: '500',
          color: '#525252',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          '&[dataActive]': {
            backgroundColor: '#e5e5e5',
            color: '#262626',
          },
        },
      },
    },

    Tabs: {
      defaultProps: {
        radius: 'md',
        variant: 'pills',
      },
      styles: {
        tab: {
          border: '1px solid #d4d4d4 !important',
          backgroundColor: '#ffffff !important',
          color: '#525252 !important',
          fontWeight: '500',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#f5f5f5 !important',
            borderColor: '#a3a3a3 !important',
          },
          '&[dataActive]': {
            backgroundColor: '#262626 !important',
            color: '#ffffff !important',
            borderColor: '#262626 !important',
            fontWeight: '600',
          },
        },
        list: {
          border: 'none',
        },
      },
    },

    Stepper: {
      styles: {
        step: {
          '&[dataProgress]': {
            backgroundColor: '#ffffff',
            borderColor: '#262626',
            color: '#262626',
          },
          '&[dataCompleted]': {
            backgroundColor: '#ffffff',
            borderColor: '#262626',
            color: '#262626',
          },
        },
        stepIcon: {
          backgroundColor: '#ffffff',
          borderColor: '#262626',
          color: '#262626',
        },
      },
    },
  },
});