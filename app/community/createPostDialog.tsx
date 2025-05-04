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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { label: "Success Stories", value: "success_stories" },
  { label: "Questions", value: "questions" },
  { label: "Resources", value: "resources" },
];

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
  const [popOverOpen, setPopOverOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [language, setLanguage] = useState("");
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImageFile(acceptedFiles[0]);
    }
  };
  const toggleItem = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
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
    const selected_text = selected.join("|");
    console.log("selected: ", selected_text);
    formData.append("tags", selected_text);
    formData.append("language", language);
    formData.append("description", description);
    formData.append("userDetails", JSON.stringify(user));
    if (imageFile) formData.append("file", imageFile);
    console.log(formData);
    const savePost = axios.post("/api/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    setDescription("");
    setSelected([]);
    setImageFile(null);
    setLanguage("");
    setPopOverOpen(false);
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
        <Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
          <PopoverTrigger asChild>
            <button className="w-full mt-4 inline-flex items-center justify-between rounded-md border px-4 py-2 text-sm">
              {selected.length > 0 ? selected.join(", ") : "Select tags"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleItem(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Select value={language} onValueChange={(value) => setLanguage(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="Kannada">Kannada</SelectItem>
            <SelectItem value="Gujrati">Gujrati</SelectItem>
            <SelectItem value="Punjabi">Punjabi</SelectItem>
            <SelectItem value="Tamil">Tamil</SelectItem>
            <SelectItem value="Marathi">Marathi</SelectItem>
            <SelectItem value="Telugu">Telugu</SelectItem>
            <SelectItem value="Odia">Odia</SelectItem>
            <SelectItem value="Malayalam">Malayalam</SelectItem>
            <SelectItem value="Bengali">Bengali</SelectItem>
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
