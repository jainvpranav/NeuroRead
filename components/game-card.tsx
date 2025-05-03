"use client"

import { motion } from "framer-motion"
import { GamepadIcon as GameController, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

interface GameCardProps {
  game: {
    title: string
    description: string
    category: string
    level: string
    link: string
    image: string
  }
  delay?: number
}

export function GameCard({ game, delay = 0 }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden h-full bg-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
              animate={{ opacity: isHovered ? 0.9 : 0.7 }}
              transition={{ duration: 0.3 }}
            />
            <img src={game.image || "/placeholder.svg"} alt={game.title} className="w-full h-[220px] object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                {game.category}
              </Badge>
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                {game.level}
              </Badge>
            </div>
            <motion.div
              className="absolute inset-0 flex flex-col justify-end p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: isHovered ? 0 : 10 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <h3 className="text-2xl font-bold mb-2">{game.title}</h3>
              <motion.p
                className="text-sm text-white/90 mb-4"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {game.description}
              </motion.p>
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  asChild
                  variant="default"
                  className="rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                >
                  <a href={game.link} target="_blank" rel="noopener noreferrer">
                    <GameController className="mr-2 h-4 w-4" /> Play Now
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
