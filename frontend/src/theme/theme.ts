import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  // Font Family - Modern monochrome design
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

  // Shadows - Subtle monochrome
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0, 0, 0, 0.10)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.08)',
  },

  // Colors - Monochrome with grayscale
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
    // Status colors in grayscale
    green: [
      '#f8f9fa', '#f1f3f4', '#e8eaed', '#dadce0', '#bdc1c6',
      '#9aa0a6', '#80868b', '#5f6368', '#3c4043', '#202124'
    ],
    yellow: [
      '#f8f9fa', '#f1f3f4', '#e8eaed', '#dadce0', '#bdc1c6',
      '#9aa0a6', '#80868b', '#5f6368', '#3c4043', '#202124'
    ],
    red: [
      '#f8f9fa', '#f1f3f4', '#e8eaed', '#dadce0', '#bdc1c6',
      '#9aa0a6', '#80868b', '#5f6368', '#3c4043', '#202124'
    ],
    blue: [
      '#f8f9fa', '#f1f3f4', '#e8eaed', '#dadce0', '#bdc1c6',
      '#9aa0a6', '#80868b', '#5f6368', '#3c4043', '#202124'
    ],
    orange: [
      '#f8f9fa', '#f1f3f4', '#e8eaed', '#dadce0', '#bdc1c6',
      '#9aa0a6', '#80868b', '#5f6368', '#3c4043', '#202124'
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

  // Components - Monochrome styling
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
      // variants: {
      //   filled: () => ({
      //     root: {
      //       backgroundColor: '#262626',
      //       color: '#ffffff',
      //       border: '1px solid #262626',
      //       '&:hover': {
      //         backgroundColor: '#404040',
      //         border: '1px solid #404040',
      //       },
      //     },
      //   }),
      //   outline: () => ({
      //     root: {
      //       backgroundColor: 'transparent',
      //       color: '#262626',
      //       border: '1px solid #d4d4d4',
      //       '&:hover': {
      //         backgroundColor: '#f5f5f5',
      //         border: '1px solid #a3a3a3',
      //       },
      //     },
      //   }),
      //   subtle: () => ({
      //     root: {
      //       backgroundColor: '#f5f5f5',
      //       color: '#525252',
      //       border: '1px solid transparent',
      //       '&:hover': {
      //         backgroundColor: '#e5e5e5',
      //       },
      //     },
      //   }),
      //   gradient: () => ({
      //     root: {
      //       backgroundColor: '#262626',
      //       color: '#ffffff',
      //       border: '1px solid #262626',
      //       background: 'linear-gradient(135deg, #404040 0%, #262626 100%)',
      //       '&:hover': {
      //         background: 'linear-gradient(135deg, #525252 0%, #404040 100%)',
      //       },
      //     },
      //   }),
      // },
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
      // variants: {
      //   light: () => ({
      //     root: {
      //       backgroundColor: '#f5f5f5',
      //       color: '#525252',
      //       border: '1px solid #e5e5e5',
      //     },
      //   }),
      //   filled: () => ({
      //     root: {
      //       backgroundColor: '#262626',
      //       color: '#ffffff',
      //     },
      //   }),
      //   outline: () => ({
      //     root: {
      //       backgroundColor: 'transparent',
      //       color: '#525252',
      //       border: '1px solid #d4d4d4',
      //     },
      //   }),
      // },
    },

    Alert: {
      defaultProps: {
        radius: 'md',
        variant: 'light',
      },
      styles: {
        root: {
          border: '1px solid #e5e5e5',
        },
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
            borderColor: '#737373',
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
            borderColor: '#737373',
          },
        },
      },
    },

    Progress: {
      defaultProps: {
        size: 'sm',
        radius: 'md',
      },
      styles: {
        root: {
          backgroundColor: '#f5f5f5',
        },
        bar: {
          backgroundColor: '#525252',
        },
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