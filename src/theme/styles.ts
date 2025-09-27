import { mode } from '@chakra-ui/theme-tools';
export const globalStyles = {
  colors: {
    // Mistral Brand Colors
    mistral: {
      red: '#E10500',
      orangeDark: '#FA500F', 
      orange: '#FF8205',
      orangeLight: '#FFAF00',
      yellow: '#FFD800',
      beigeLight: '#FFFAEB',
      beigeMedium: '#FFF0C3',
      beigeDark: '#E9E2CB',
      black: '#000000',
      blackTinted: '#1E1E1E',
    },
    brand: {
      100: '#FFFAEB', // Beige Light
      200: '#FFD800', // Yellow
      300: '#FFAF00', // Orange Light  
      400: '#FF8205', // Orange
      500: '#FA500F', // Orange Dark - Primary
      600: '#E10500', // Red
      700: '#1E1E1E', // Black Tinted
      800: '#000000', // Black
      900: '#000000', // Black
    },
    brandScheme: {
      100: '#FFFAEB', // Beige Light
      200: '#FFD800', // Yellow
      300: '#FFAF00', // Orange Light
      400: '#FF8205', // Orange
      500: '#FA500F', // Orange Dark - Primary
      600: '#E10500', // Red
      700: '#1E1E1E', // Black Tinted
      800: '#000000', // Black
      900: '#000000', // Black
    },
    brandTabs: {
      100: '#FFFAEB', // Beige Light
      200: '#FFD800', // Yellow
      300: '#FFAF00', // Orange Light
      400: '#FF8205', // Orange
      500: '#FA500F', // Orange Dark - Primary
      600: '#E10500', // Red
      700: '#1E1E1E', // Black Tinted
      800: '#000000', // Black
      900: '#000000', // Black
    },
    secondaryGray: {
      100: '#E0E5F2',
      200: '#E2E8F0',
      300: '#F4F7FE',
      400: '#E9EDF7',
      500: '#718096',
      600: '#A3AED0',
      700: '#707EAE',
      800: '#707EAE',
      900: '#1B2559',
    },
    red: {
      100: '#FFFAEB', // Beige Light as lighter red
      500: '#E10500', // Mistral Red
      600: '#E10500', // Mistral Red
    },
    blue: {
      50: '#EFF4FB',
      500: '#FF8205',
    },
    orange: {
      100: '#FFF0C3', // Beige Medium
      500: '#FF8205', // Mistral Orange
      600: '#FA500F', // Mistral Orange Dark
    },
    green: {
      100: '#E6FAF5',
      500: '#01B574',
    },
    white: {
      50: '#ffffff',
      100: '#ffffff',
      200: '#ffffff',
      300: '#ffffff',
      400: '#ffffff',
      500: '#ffffff',
      600: '#ffffff',
      700: '#ffffff',
      800: '#ffffff',
      900: '#ffffff',
    },
    navy: {
      50: '#FFF0C3',
      100: '#FFFAEB',
      200: '#E9E2CB',
      300: '#718096',
      400: '#4A5568',
      500: '#2D3748',
      600: '#1A202C',
      700: '#1B254B',
      800: '#111c44',
      900: '#0b1437',
    },
    gray: {
      100: '#FAFCFE',
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        overflowX: 'hidden',
        bg: mode('#ffffff', 'navy.900')(props),
        fontFamily: 'Plus Jakarta Sans',
      },
      input: {
        color: 'gray.700',
      },
      html: {
        fontFamily: 'Plus Jakarta Sans',
      },
    }),
  },
};
