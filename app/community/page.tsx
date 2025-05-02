"use client";

import type React from "react";
// import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2 } from "lucide-react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CreatePostDialog from "./createPostDialog";
import PageLoader from "@/components/ui/page-loader";

export default function Community() {
  // const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [postLike, setPostLike] = useState([false]);
  const getPosts = async () => {
    const posts = await axios.get("/api/posts");
    if (posts.status === 200) {
      setPosts(posts.data);
      setPostLike(
        posts.data.map((post: any) => {
          return false;
        })
      );
    }
  };
  useEffect(() => {
    getPosts();
  }, []);

  function handleLike(e: any, index: number): any {
    // setIsLiking(true);
    e.preventDefault();
    setPostLike((currentLikes: any) => {
      const newLikes = [...currentLikes]; // Create a copy of the array
      newLikes[index] = !currentLikes[index]; // Modify the copy
      return newLikes; // Return the modified copy
    });
    const formData = new FormData();
    formData.append("type", "like");
    formData.append("post_id", posts[index]["post_id"]);
    formData.append("post_likes", posts[index]["likes"]);
    const like = axios.post("/api/posts", formData);
    getPosts().finally(() => {
      setPostLike((currentLikes: any) => {
        const newLikes = [...currentLikes]; // Create a copy of the array
        newLikes[index] = !currentLikes[index]; // Modify the copy
        return newLikes; // Return the modified copy
      });
    });
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1 container py-8 border-2 border-indigo-500 overflow-auto ">
          <div className="flex justify-between items-center">
            {/* <Button className="ml-auto bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold px-6 py-2 rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300 m-1">
            Create Post
            </Button> */}
            <div className="p-4">
              <CreatePostDialog />
            </div>
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {posts.length >= 1 ? (
              posts.map((post: any, index: number) => {
                return (
                  <Card
                    className="mb-4 break-inside-avoid p-2 rounded shadow"
                    key={index}
                  >
                    <CardHeader className="m-0 p-0">
                      <div className="flex flex-row items-center gap-2">
                        <Avatar className="m-1">
                          <AvatarImage src={post.profile_pic_link} />
                          <AvatarFallback>NR</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{post.username}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <span>{post.description}</span>
                      </div>
                      <img
                        className="rounded-md"
                        src={post.image_link}
                        alt="Community Post Image"
                      />
                    </CardContent>
                    <CardFooter className="flex justify-center items-center gap-2">
                      <Button
                        className="bg-transparent hover:bg-transparent"
                        onClick={() => {
                          handleLike(event, index);
                        }}
                      >
                        {<Heart color={postLike[index] ? "red" : "white"} />}
                        <span className="text-white">{post.likes}</span>
                      </Button>
                      <Button className="bg-transparent hover:bg-transparent">
                        <Share2 color="white" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <Skeleton className="w-100 h-100 rounded-xl" />
            )}
          </div>
        </main>
      </div>
    </Suspense>
  );
}
