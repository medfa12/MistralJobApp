'use client';

import type { Variants } from 'framer-motion';

const fm: any = (() => {
  try {
    return require('framer-motion');
  } catch (err) {
    return {};
  }
})();

const motion = fm.motion ?? fm.default?.motion;
const AnimatePresence = fm.AnimatePresence ?? fm.default?.AnimatePresence;

export { motion, AnimatePresence };
export type { Variants };
export default fm;
