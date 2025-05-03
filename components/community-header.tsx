import { motion } from "framer-motion"
import { Users, Sparkles, TrendingUp } from "lucide-react"
import { useMemo } from "react"

export function CommunityHeader() {
  const bubbles = useMemo(() => {
    return [...Array(10)].map(() => ({
      opacity: Math.random() * 0.3 + 0.1,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-purple-800 to-pink-700 py-12 px-4 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: bubble.opacity,
              scale: 1,
              x: bubble.x,
              y: bubble.y,
            }}
            transition={{
              duration: bubble.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: bubble.delay,
            }}
          />
        ))}
      </div>
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white/20 backdrop-blur-sm p-3 rounded-full"
          >
            <Users className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold">Community Space</h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-purple-100 max-w-2xl mx-auto mb-6"
        >
          Share your journey, connect with others, and find inspiration in our supportive community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mt-6"
        >
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">1.2k Active Members</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-300" />
            <span className="text-sm font-medium">250+ Posts Today</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
