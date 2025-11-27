'use client';

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Color palette - Dark but not pure black
const colors = {
  brand: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  background: {
    primary: '#0f1419',
    secondary: '#1a1f2e',
    tertiary: '#252d3d',
  },
  text: {
    primary: '#e8eaed',
    secondary: '#9aa0a6',
    tertiary: '#5f6368',
  },
  success: {
    500: '#10b981',
    600: '#059669',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
};

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: {
    body: {
      bg: 'background.primary',
      color: 'text.primary',
    },
  },
};

const components = {
  Card: {
    baseStyle: {
      container: {
        bg: 'background.secondary',
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'whiteAlpha.100',
      },
    },
  },
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
        },
      },
      ghost: {
        _hover: {
          bg: 'background.tertiary',
        },
      },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: 'background.tertiary',
          border: '1px solid',
          borderColor: 'whiteAlpha.100',
          _hover: {
            bg: 'background.tertiary',
            borderColor: 'whiteAlpha.200',
          },
          _focus: {
            bg: 'background.tertiary',
            borderColor: 'brand.500',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: 'whiteAlpha.100',
          color: 'text.secondary',
          textTransform: 'uppercase',
          fontSize: 'xs',
          fontWeight: 'bold',
          letterSpacing: 'wider',
        },
        td: {
          borderColor: 'whiteAlpha.100',
        },
      },
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },
});

export default theme;
