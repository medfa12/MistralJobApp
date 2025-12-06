'use client';

// Wrapper to safely import framer-motion when the bundler/runtime treats it
// as CommonJS. Use namespace import and re-export the pieces we use.
import * as fm from 'framer-motion';

const { motion, AnimatePresence } = fm;

export { motion, AnimatePresence };
export type { Variants } from 'framer-motion';
export default fm;
