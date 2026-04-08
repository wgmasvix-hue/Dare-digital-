import { motion } from 'motion/react';

export default function PowerTag({ text, className = "" }) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        ⚡
      </motion.span>
      {text}
    </motion.div>
  );
}
