"use client"

import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <motion.div
      className="text-center space-y-6 max-w-3xl mx-auto mt-12 mb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          Play & Learn
        </h1>
      </motion.div>

      <motion.p
        className="text-gray-600 text-center text-lg max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Interactive games designed to enhance reading and spelling skills through fun and engagement.
      </motion.p>

      <motion.div
        className="flex justify-center gap-4 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl">🎮</span>
        </motion.div>
        <motion.div
          className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl">📚</span>
        </motion.div>
        <motion.div
          className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl">🧠</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
