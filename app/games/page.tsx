"use client"

import PageLoader from "@/components/ui/page-loader"
import { Suspense, useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { HeroSection } from "@/components/hero-section"
import { GameCard } from "@/components/game-card"
import { Navbar } from "@/components/navbar"

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const games = [
    {
      title: "Phonics Match",
      description: "Match sounds with letters in this fun phonics game",
      category: "Reading",
      level: "Beginner",
      link: "https://app.lexercise.com/mylexercise/index/index/demo/2c9h67mizr6fhkl8",
      image: "/game1.png",
    },
    {
      title: "Spelling Sprint",
      description: "Race against time to spell words correctly",
      category: "Spelling",
      level: "Intermediate",
      link: "https://app.lexercise.com/mylexercise/index/index/demo/ll4m2gkogxhzc0zj",
      image: "/game2.png",
    },
    {
      title: "Word Builder",
      description: "Build words from letters to improve vocabulary",
      category: "Vocabulary",
      level: "Advanced",
      link: "https://app.lexercise.com/mylexercise/index/index/demo/sxpdew5apwhq747m",
      image: "/game3.jpg",
    },
  ]

  const filteredGames = games.filter(
    (game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
      <Suspense fallback={<PageLoader />}>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <Navbar />
        <main className="flex flex-col items-center p-6">
          <HeroSection />
          <motion.div
            className="w-full max-w-md mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search games by title...."
                className="pl-10 pr-4 py-2 rounded-full border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {filteredGames.map((game, idx) => (
              <GameCard key={idx} game={game} delay={idx} />
            ))}
          </motion.div>

          {filteredGames.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8">
              <p className="text-gray-500">No games found matching your search. Try a different term.</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h2>
            <p className="text-gray-600">More exciting games are on the way! Check back soon for updates.</p>
          </motion.div>
        </main>
      </div>
      </Suspense>
  )
}
