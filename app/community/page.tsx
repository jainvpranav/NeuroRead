"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2 } from "lucide-react";

export default function Community() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);
  if (!user) return null;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8 border-2 border-indigo-500 overflow-auto ">
        <div className="flex flex-row justify-center items-start gap-2 flex-wrap">
          <Card className="w-[400px]">
            <CardHeader className="m-0 p-0">
              <div className="flex flex-row items-center gap-2">
                <Avatar className="m-1">
                  <AvatarImage src="https://github.com/vrcel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <span className="text-xs">UserName</span>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <span>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Libero magni sed fugiat eos nulla ex! Repudiandae doloribus
                  possimus porro corporis ex hic saepe sit, omnis cum quisquam
                  vero itaque molestiae! Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Quibusdam velit reiciendis, nulla quod sequi
                  quia recusandae. Provident sapiente dolore obcaecati
                  recusandae inventore commodi aperiam odio ducimus, excepturi
                  ea dolorum
                </span>
              </div>
              <img
                className="rounded-md"
                src="https://github.com/vercel.png"
                alt="SomeImg"
              ></img>
            </CardContent>
            <CardFooter className="flex justify-center items-center gap-2">
              <Heart />
              <Share2 />
            </CardFooter>
          </Card>
          <Card className="w-[400px]">
            <CardHeader className="m-0 p-0">
              <div className="flex flex-row items-center gap-2">
                <Avatar className="m-1">
                  <AvatarImage src="https://github.com/vrcel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <span className="text-xs">UserName</span>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <span>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Libero magni sed fugiat eos nulla ex! Repudiandae doloribus
                  possimus porro corporis ex hic saepe sit, omnis cum quisquam
                  vero itaque molestiae! Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Quibusdam velit reiciendis, nulla quod sequi
                  q voluptatum neque autem itaque reprehenderit! Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Explicabo
                  pariatur fugiat veritatis tempore molestiae voluptatum
                  voluptatibus, facilis error deserunt, distinctio nostrum.
                  Voluptatem, nihil aliquid debitis provident quis rem placeat
                  doloremque?
                </span>
              </div>
              <img
                className="rounded-md"
                src="https://github.com/vercel.png"
                alt="SomeImg"
              ></img>
            </CardContent>
            <CardFooter className="flex justify-center items-center gap-2">
              <Heart />
              <Share2 />
            </CardFooter>
          </Card>
          <Card className="w-[400px]">
            <CardHeader className="m-0 p-0">
              <div className="flex flex-row items-center gap-2">
                <Avatar className="m-1">
                  <AvatarImage src="https://github.com/vrcel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <span className="text-xs">UserName</span>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <span>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Libero magni sed fugiat eos nulla ex! Repudiandae doloribus
                  possimus porro corporis ex hic saepe sit, omnis cum quisquam
                  vero itaque molestiae! Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Quibusdam velit reiciendis, nulla quod sequi
                  quia recusandae. Provident sapiente dolore obcaecati
                  recusandae inventore commodi aperiam odio ducimus, excepturi
                  ea dolorum enim?Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Vero, quam? Omnis pariatur a iure unde optio
                  voluptatem, maiores perferendis, veritatis quidem incidunt,
                  placeat dolore repellendus voluptatum neque autem itaque
                  reprehenderit! Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Explicabo pariatur fugiat veritatis tempore
                  molestiae voluptatum voluptatibus, facilis error deserunt,
                  distinctio nostrum. Voluptatem, nihil aliquid debitis
                  provident quis rem placeat doloremque?
                </span>
              </div>
              <img
                className="rounded-md"
                src="https://github.com/vercel.png"
                alt="SomeImg"
              ></img>
            </CardContent>
            <CardFooter className="flex justify-center items-center gap-2">
              <Heart />
              <Share2 />
            </CardFooter>
          </Card>
          <Card className="w-[400px]">
            <CardHeader className="m-0 p-0">
              <div className="flex flex-row items-center gap-2">
                <Avatar className="m-1">
                  <AvatarImage src="https://github.com/vrcel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <span className="text-xs">UserName</span>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <span>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Libero magni sed fugiat eos nulla ex! Repudiandae doloribus
                  possimus porro corporis ex hic saepe sit, omnis cum quisquam
                  vero itaque molestiae! Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Quibusdam velit reiciendis, nulla quod sequi
                  quia recusandae. Provident sapiente dolore obcaecati
                  recusandae inventore commodi aperiam odio ducimus, excepturi
                  ea dolorum enim?Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Vero, quam? Omnis pariatur a iure unde optio
                  voluptatem, maiores perferendis, veritatis quidem incidunt,
                  placeat dolore repellendus voluptatum neque autem itaque
                  reprehenderit! Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Explicabo pariatur fugiat veritatis tempore
                  molestiae voluptatum voluptatibus,
                </span>
              </div>
              <img
                className="rounded-md"
                src="https://github.com/vercel.png"
                alt="SomeImg"
              ></img>
            </CardContent>
            <CardFooter className="flex justify-center items-center gap-2">
              <Heart />
              <Share2 />
            </CardFooter>
          </Card>
          <Card className="w-[400px]">
            <CardHeader className="m-0 p-0">
              <div className="flex flex-row items-center gap-2">
                <Avatar className="m-1">
                  <AvatarImage src="https://github.com/vrcel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <span className="text-xs">UserName</span>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <span>
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Latibus, facilis error deserunt, distinctio nostrum.
                  Voluptatem, nihil aliquid debitis provident quis rem placeat
                  doloremque?
                </span>
              </div>
              <img
                className="rounded-md"
                src="https://github.com/vercel.png"
                alt="SomeImg"
              ></img>
            </CardContent>
            <CardFooter className="flex justify-center items-center gap-2">
              <Heart />
              <Share2 />
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
