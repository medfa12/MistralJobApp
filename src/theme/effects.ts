export const glassEffects = {
  light: {
    backdropFilter: 'blur(16px) saturate(180%)',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    border: '1px solid rgba(209, 213, 219, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  dark: {
    backdropFilter: 'blur(16px) saturate(180%)',
    backgroundColor: 'rgba(17, 25, 40, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.125)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  },
};

export const glassButton = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(209, 213, 219, 0.5)',
    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
    _hover: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px 0 rgba(31, 38, 135, 0.3)',
    },
  },
  dark: {
    backgroundColor: 'rgba(26, 32, 44, 0.9)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.4)',
    _hover: {
      backgroundColor: 'rgba(26, 32, 44, 0.95)',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.5)',
    },
  },
};

