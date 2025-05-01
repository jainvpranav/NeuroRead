"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Upload, FileUp, ImageIcon, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{
    user_id: Number;
    name: string;
    profile_pic_link: string;
    email: string;
    role: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);

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
        // setError(err.response?.data?.error || "Something went wrong")
      }
    };
    // Get recent analyses
    const diagnosis = async () => {
      const res = await axios.get("/api/dashboard");
      if (res.status === 200) {
        setRecentAnalyses(res.data.diagnosis);
      } else setRecentAnalyses([]);
    };
    // const history = JSON.parse(localStorage.getItem("analysisHistory") || "[]");
    // setRecentAnalyses(history.slice(0, 3));
    getUserDetails();
    diagnosis();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = () => {
    const formData = new FormData();
    if (selectedFile) formData.append("file", selectedFile);
    formData.append("studentName", studentName.trim());
    if (user) formData.append("currentUserId", user.user_id.toString());
    const fileUploaded = axios.post("/api/dashboard", formData);
    console.log(fileUploaded);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !studentName) return;
    setIsUploading(true);
    const newAnalysis: any = uploadImage();
    // Simulate upload and processing with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        // Save analysis to history
        // const history = JSON.parse(
        //   localStorage.getItem("analysisHistory") || "[]"
        // );
        // const newAnalysis = {
        //   id: Date.now().toString(),
        //   studentName,
        //   date: new Date().toISOString(),
        //   imageUrl: previewUrl,
        //   // Updated metrics
        //   results: {
        //     dyslexiaScore: Math.floor(Math.random() * 100),
        //     motorVariability: Math.random() * 5 + 1,
        //     orthographicIrregularity: Math.random() * 5 + 1,
        //     writingDynamics: Math.random() * 5 + 1,
        //     id: parseInt(Date.now().toString()),
        //   },
        // };

        // history.unshift(newAnalysis);
        // localStorage.setItem("analysisHistory", JSON.stringify(history));

        // Navigate to results page
        router.push(`/results/${newAnalysis.diagnose_id}`);
      }
    }, 500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getRiskLevelClass = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Upload and analyze handwriting samples
            </p>
          </div>
          <Button
            onClick={() => router.push("/history")}
            variant="outline"
            className="rounded-full"
          >
            View All History
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <Card className="md:col-span-2 lg:col-span-3 border-none shadow-lg">
            <Tabs defaultValue="upload" className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Handwriting Analysis</CardTitle>
                  <TabsList>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="camera">Camera</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  Upload a clear image of the student's handwriting to analyze
                  for dyslexia indicators
                </CardDescription>
              </CardHeader>

              <TabsContent value="upload">
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Enter student name"
                        className="focus-visible:ring-primary"
                        required
                      />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="handwriting">Handwriting Sample</Label>
                      <div
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all ${
                          previewUrl
                            ? "border-primary/40 bg-primary/5"
                            : "hover:bg-muted/50 hover:border-primary/30"
                        }`}
                        onClick={() =>
                          document.getElementById("handwriting")?.click()
                        }
                      >
                        <Input
                          id="handwriting"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          required
                        />

                        {previewUrl ? (
                          <div className="space-y-4 flex flex-col items-center">
                            <div className="relative w-full max-w-md h-64">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl || "/placeholder.svg"}
                                alt="Handwriting preview"
                                className="w-full h-full object-contain rounded-lg"
                              />
                            </div>
                            <div className="flex items-center gap-2 text-primary">
                              <FileUp className="h-4 w-4" />
                              <span>Click to change file</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-primary/10">
                              <Upload className="h-10 w-10 text-primary" />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <p className="text-sm font-medium">
                                Click to upload
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG or GIF (Max 10MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {isUploading ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Analyzing handwriting...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    ) : (
                      <Button
                        type="submit"
                        className="w-full gradient-bg rounded-full"
                        disabled={!selectedFile || !studentName || isUploading}
                      >
                        Analyze Handwriting
                      </Button>
                    )}
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="camera">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Camera Capture</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    This feature allows you to take a photo of handwriting
                    directly with your device's camera.
                  </p>
                  <Button variant="outline" className="rounded-full">
                    Coming Soon
                  </Button>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="md:row-span-2 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>
                Your most recent handwriting analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis.diagnose_id}
                      className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/results/${analysis.diagnose_id}`)
                      }
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {analysis.studentName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(analysis.diagnosed_at)}
                          </p>
                        </div>
                        <Badge
                          className={`${getRiskLevelClass(
                            analysis.dyslexia_risk_score
                          )} hover:${getRiskLevelClass(
                            analysis.dyslexia_risk_score
                          )}`}
                        >
                          {analysis.dyslexia_risk_score}%
                        </Badge>
                      </div>
                      <div className="relative h-20 w-full rounded-md overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            analysis.image_uploaded_link || "/placeholder.svg"
                          }
                          alt="Handwriting sample"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No analyses yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your first handwriting sample to get started
                  </p>
                </div>
              )}
            </CardContent>
            {recentAnalyses.length > 0 && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/history")}
                >
                  View All History
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="md:col-span-2 lg:col-span-3 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Tips for Better Analysis</CardTitle>
              <CardDescription>
                Follow these guidelines to get the most accurate results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>For best results</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Use lined paper for the handwriting sample</li>
                    <li>
                      Ask the student to write a paragraph of at least 3-4
                      sentences
                    </li>
                    <li>
                      Ensure the writing includes a mix of common and complex
                      words
                    </li>
                    <li>
                      Capture the entire writing process if possible (for
                      writing dynamics)
                    </li>
                    <li>Make sure the entire sample is visible and in focus</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
