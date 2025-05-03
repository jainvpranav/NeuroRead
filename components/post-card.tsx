"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share2, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PostCardProps {
  post: any
  index: number
  isLiked: boolean
  tags: string
  onLike: (e: any, index: number) => void
}

export function PostCard({ post, index, isLiked, tags, onLike }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 70 }}
      className="break-inside-avoid mb-6"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden bg-gray-800/60 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-colors duration-300 my-5">
        <CardHeader className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border border-purple-500/30">
                <AvatarImage src={post.profile_pic_link || "/placeholder.svg"} />
                <AvatarFallback className="bg-purple-800 text-white">
                  {post.username?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{post.username}</span>
                <span className="text-xs text-gray-400">{post.timestamp || "Just now"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/30 text-xs">
                {post.tags || "Post"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem className="hover:bg-gray-700">Save Post</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700">Report</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700">Hide</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {post.description && <p className="text-sm text-gray-200 mb-3">{post.description}</p>}

          {post.image_link && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative rounded-md overflow-hidden"
            >
              <img
                className="w-full h-auto rounded-md object-cover"
                src={post.image_link || "/placeholder.svg"}
                alt={`${post.username}'s post`}
              />
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="p-3 pt-1 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 1.2 }}
              className="flex items-center gap-1 text-sm group"
              onClick={(e) => onLike(e, index)}
            >
              <Heart
                className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-400"} transition-colors`}
              />
              <span className={`${isLiked ? "text-red-500" : "text-gray-400 group-hover:text-red-400"}`}>
                {post.likes || 0}
              </span>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 1.2 }}
              className="text-gray-400 hover:text-purple-400"
              onClick={(e) => {
                e.preventDefault()
                navigator
                  .share({
                    title: `${post.username}'s post`,
                    text: post.description,
                    url: window.location.href,
                  })
                  .catch((err) => console.error("Error sharing:", err))
              }}
            >
              <Share2 className="h-5 w-5" />
            </motion.button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
