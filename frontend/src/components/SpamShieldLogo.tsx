import { Box } from '@mantine/core';

interface SpamShieldLogoProps {
  size?: number;
  variant?: 'primary' | 'monochrome';
}

export function SpamShieldLogo({ size = 24, variant = 'primary' }: SpamShieldLogoProps) {
  const primaryColors = {
    shield: '#3b82f6',
    accent: '#1d4ed8',
    highlight: '#60a5fa',
  };

  const monochromeColors = {
    shield: '#525252',
    accent: '#404040',
    highlight: '#737373',
  };

  const colors = variant === 'primary' ? primaryColors : monochromeColors;

  return (
    <Box style={{ width: size, height: size, display: 'inline-block' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield outline */}
        <path
          d="M12 2L4 6V11.09C4 16.05 7.41 20.72 12 22C16.59 20.72 20 16.05 20 11.09V6L12 2Z"
          fill={colors.shield}
          stroke={colors.accent}
          strokeWidth="0.5"
        />
        
        {/* Inner protection layer */}
        <path
          d="M12 4L6 7V11.09C6 15.05 8.71 18.72 12 20C15.29 18.72 18 15.05 18 11.09V7L12 4Z"
          fill={colors.highlight}
          opacity="0.3"
        />
        
        {/* Email envelope symbol */}
        <rect
          x="8"
          y="9"
          width="8"
          height="6"
          rx="1"
          fill="white"
          stroke={colors.accent}
          strokeWidth="0.8"
        />
        
        {/* Email content lines */}
        <line
          x1="9"
          y1="11"
          x2="15"
          y2="11"
          stroke={colors.accent}
          strokeWidth="0.6"
        />
        <line
          x1="9"
          y1="12.5"
          x2="13"
          y2="12.5"
          stroke={colors.accent}
          strokeWidth="0.6"
        />
        
        {/* Spam blocking X */}
        <path
          d="M10 13.5L14 9.5M14 13.5L10 9.5"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Security dots */}
        <circle cx="7" cy="8" r="0.8" fill={colors.highlight} opacity="0.6" />
        <circle cx="17" cy="8" r="0.8" fill={colors.highlight} opacity="0.6" />
        <circle cx="7" cy="16" r="0.8" fill={colors.highlight} opacity="0.6" />
        <circle cx="17" cy="16" r="0.8" fill={colors.highlight} opacity="0.6" />
      </svg>
    </Box>
  );
}