'use client';

import { motion } from 'framer-motion';

export function AnimatedTagline({ text }: { text: string }) {
  const chars = text.split('');

  return (
    <motion.p
      className="text-sm text-neon-blue/50 animate-subtle-shimmer cursor-default"
      initial="hidden"
      animate="visible"
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3 },
      }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: (chars.length - 1 - i) * 0.05 }}
          whileHover={{
            y: -2,
            color: 'var(--neon-blue)',
            textShadow: '0 0 10px var(--neon-blue)',
            transition: { duration: 0.2 },
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.p>
  );
}
