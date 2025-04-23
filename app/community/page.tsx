"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

export default function Community() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const getPosts = async () => {
      const posts = await axios.get("/api/posts");
      console.log(posts);
      if (posts.status === 200) setPosts(posts.data);
    };
    getPosts();
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 border-2 border-indigo-500 overflow-auto ">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {posts.map((post: any, index: number) => {
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
                  <Heart />
                  <Share2 />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
