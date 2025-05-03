"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreatePostDialog() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImageFile(acceptedFiles[0]);
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const res = await axios.get("/api/auth/cookies");
        if (res.status === 200) {
          setUser(JSON.parse(res.data.user.value).user);
        } else {
          router.push("/login");
        }
      } catch (err: any) {
        router.push("/login");
      }
    };
    getUserDetails();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handlePost = () => {
    if (!description && !imageFile) return;
    const formData = new FormData();
    formData.append("type", "post");
    formData.append("tags", tags);
    formData.append("description", description);
    formData.append("userDetails", JSON.stringify(user));
    if (imageFile) formData.append("file", imageFile);
    const savePost = axios.post("/api/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    setDescription("");
    setTags("");
    setImageFile(null);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex justify-end">
        <DialogTrigger asChild>
          <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gradient-bg rounded-full ">
            Create Post
            <StickyNote />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>
        <Select value={tags} onValueChange={setTags}>
          <SelectTrigger className="mt-4">
            <SelectValue placeholder="Select a tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="success_stories">Success Stories</SelectItem>
            <SelectItem value="questions|resources">Questions</SelectItem>
            <SelectItem value="resources|questions">Resources</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Write something..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div
          {...getRootProps()}
          className={`mt-4 flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all ${
            isDragActive ? "border-pink-500 bg-pink-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {imageFile ? (
            <Image
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              width={200}
              height={200}
              className="object-cover rounded"
            />
          ) : (
            <p className="text-gray-500">
              Drag and drop an image, or click to select
            </p>
          )}
        </div>

        <Button onClick={handlePost} className="mt-4 w-full">
          Post
        </Button>
      </DialogContent>
    </Dialog>
  );
}
