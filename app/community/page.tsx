"use client"

import { useState, useEffect, Suspense } from "react"
import { Navbar } from "@/components/navbar"
import axios from "axios"
import PageLoader from "@/components/ui/page-loader"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import CreatePostDialog from "./createPostDialog"
import { CommunityHeader } from "@/components/community-header"
import { PostCard } from "@/components/post-card"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Post {
  post_id: string;
  likes: number;
  [key: string]: any; // optional if other dynamic fields exist
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postLike, setPostLike] = useState([false])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const getPosts = async () => {
    setIsLoading(true)
    try {
      const posts = await axios.get("/api/posts")
      if (posts.status === 200) {
        setPosts(posts.data)
        setPostLike(
          posts.data.map((post: any) => {
            return false
          }),
        )
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getPosts()
  }, [])

  function handleLike(e: any, index: number): any {
    e.preventDefault()

    setPostLike((currentLikes: any) => {
      const newLikes = [...currentLikes]
      newLikes[index] = !currentLikes[index]
      return newLikes
    })

    // Update post likes count optimistically
    setPosts((currentPosts) => {
      const newPosts = [...currentPosts]
      const currentLikeStatus = postLike[index]
      newPosts[index] = {
        ...newPosts[index],
        likes: currentLikeStatus ? Math.max(0, newPosts[index].likes - 1) : newPosts[index].likes + 1,
      }
      return newPosts
    })

    // Send request to server
    const formData = new FormData()
    formData.append("type", "like")
    formData.append("post_id", posts[index].post_id)
    formData.append("post_likes", String(posts[index].likes))
    axios.post("/api/posts", formData).catch((error) => {
      console.error("Error liking post:", error)
      // Revert optimistic update on error
      setPostLike((currentLikes: any) => {
        const newLikes = [...currentLikes]
        newLikes[index] = !currentLikes[index]
        return newLikes
      })
      getPosts()
    })
  }

  const filteredPosts = posts?.filter((post: any) => {
    if (activeTab !== "all" && post.category !== activeTab) return false
    if (
      searchQuery &&
      !post.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !post.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navbar />
      <CommunityHeader />

      <main className="flex-1 container py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div className="w-full md:w-auto">
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800/50 backdrop-blur-sm">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="success">Success Stories</TabsTrigger>
                <TabsTrigger value="question">Questions</TabsTrigger>
                <TabsTrigger value="resource">Resources</TabsTrigger>
              </TabsList>
            </Tabs>
            
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search posts..."
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* <Button
              variant="outline"
              size="icon"
              className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
            </Button> */}
            <CreatePostDialog />
          </div>
        </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="break-inside-avoid mb-6">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                          <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 pt-0">
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-48 w-full bg-gray-700 rounded mt-3 animate-pulse" />
                    </div>
                    <div className="p-3 flex justify-between">
                      <div className="flex gap-4">
                        <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
                        <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredPosts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-0"
                >
                  <AnimatePresence>
                    {filteredPosts.map((post: any, index: number) => (
                      <PostCard
                        key={post.post_id || index}
                        post={post}
                        index={index}
                        isLiked={postLike[index]}
                        onLike={handleLike}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-medium mb-2">No posts found</h3>
                    <p className="text-gray-400 mb-6">
                      {searchQuery
                        ? "No posts match your search criteria. Try a different search term."
                        : "Be the first to share something with the community!"}
                    </p>
                    <CreatePostDialog />
                  </div>
                </motion.div>
              )}
            </>
          )}
      </main>
    </div>
  )
}
