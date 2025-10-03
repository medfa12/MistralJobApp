import { Variants } from 'framer-motion';

export const tabContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.15 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.15 }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.15 }
  }
};

export const inspectorPanelVariants: Variants = {
  hidden: { 
    x: 300, 
    opacity: 0,
    transition: { duration: 0.2 }
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 30 
    }
  }
};

export const elementHighlightVariants: Variants = {
  idle: { 
    scale: 1,
    opacity: 0.7,
  },
  hover: { 
    scale: 1.02,
    opacity: 1,
    transition: { 
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  selected: {
    scale: 1,
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 0.8
    }
  }
};

export const pulseVariants: Variants = {
  pulse: {
    boxShadow: [
      '0 0 0 0 rgba(255, 130, 5, 0.7)',
      '0 0 0 10px rgba(255, 130, 5, 0)',
      '0 0 0 0 rgba(255, 130, 5, 0)'
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const hoverHighlightVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.95,
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
};

export const selectedHighlightVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.9,
  },
  animate: { 
    opacity: 1,
    scale: 1,
    boxShadow: [
      '0 0 0 0 rgba(255, 130, 5, 0.6), 0 0 20px rgba(255, 130, 5, 0.3)',
      '0 0 0 8px rgba(255, 130, 5, 0), 0 0 30px rgba(255, 130, 5, 0.2)',
      '0 0 0 0 rgba(255, 130, 5, 0.6), 0 0 20px rgba(255, 130, 5, 0.3)',
    ],
    transition: {
      scale: {
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1] // Spring-like easing
      },
      boxShadow: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

export const tooltipVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 10,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

