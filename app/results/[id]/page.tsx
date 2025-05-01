"use client";

import { useState, useEffect, use } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Download,
  ArrowLeft,
  Share2,
  Printer,
  Info,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";

// Update the Analysis type to reflect the new metrics
type Analysis = {
  id: string;
  studentName: string;
  date: string;
  imageUrl: string;
  results: {
    dyslexiaScore: number;
    motorVariability: number;
    orthographicIrregularity: number;
    writingDynamics: number;
    id: number;
  };
};

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<{
    user_id: Number;
    name: string;
    profile_pic_link: string;
    email: string;
    role: string;
  } | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    // Check if user is logged in
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

    // Get analysis from history
    const history = JSON.parse(localStorage.getItem("analysisHistory") || "[]");
    const foundAnalysis = history.find((item: Analysis) => item.id === id);

    if (foundAnalysis) {
      setAnalysis(foundAnalysis);
    } else {
      router.push("/dashboard");
    }
    getUserDetails();
  }, [id, router]);

  if (!analysis) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <p>Loading results...</p>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: "Low Risk", color: "bg-green-500" };
    if (score < 70) return { level: "Moderate Risk", color: "bg-yellow-500" };
    return { level: "High Risk", color: "bg-red-500" };
  };

  const risk = getRiskLevel(analysis.results.dyslexiaScore);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex items-center mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Handwriting Sample</CardTitle>
                  <CardDescription>
                    {analysis.studentName} • {formatDate(analysis.date)}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  Sample #{analysis.id.substring(0, 4)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative w-full h-64 mb-4 border rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={analysis.imageUrl || "/placeholder.svg"}
                  alt="Handwriting sample"
                  className="w-full h-full object-contain"
                />
              </div>
              <Button variant="outline" className="w-full rounded-full">
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="bg-muted/50">
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Dyslexia indicators based on handwriting analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Overall Dyslexia Indicator Score
                  </span>
                  <span className="text-sm font-medium">
                    {analysis.results.dyslexiaScore}%
                  </span>
                </div>
                <Progress
                  value={analysis.results.dyslexiaScore}
                  className={risk.color}
                />
                <div className="flex justify-end">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${risk.color} text-white`}
                  >
                    {risk.level}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="metrics" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                  </TabsTrigger>
                </TabsList>
                {/* Replace the metrics section in the TabsContent with the new metrics */}
                <TabsContent value="metrics" className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Motor Variability</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">
                          {analysis.results.motorVariability.toFixed(1)}/5
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[220px] text-xs">
                                Measures inconsistencies in stroke patterns,
                                pressure, and spacing during handwriting,
                                reflecting deficits in motor execution.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <Progress
                      value={analysis.results.motorVariability * 20}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Orthographic Irregularity</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">
                          {analysis.results.orthographicIrregularity.toFixed(1)}
                          /5
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[220px] text-xs">
                                Detects spelling errors, letter reversals,
                                substitutions, omissions, or mirror writing
                                common in dyslexia.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <Progress
                      value={analysis.results.orthographicIrregularity * 20}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Writing Dynamics</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">
                          {analysis.results.writingDynamics.toFixed(1)}/5
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[220px] text-xs">
                                Analyzes in-air pen duration and writing speed,
                                which are influenced by cognitive load and
                                spelling deficits in dyslexia.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <Progress
                      value={analysis.results.writingDynamics * 20}
                      className="h-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="mt-0.5">
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          Professional Assessment
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Consider additional assessment by a dyslexia
                          specialist or educational psychologist.
                        </p>
                      </div>
                    </div>

                    {/* Update the recommendations section to reflect the new metrics */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Recommended Exercises</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>
                            Motor control exercises to improve consistency in
                            handwriting strokes
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>
                            Orthographic awareness activities to address letter
                            reversals and substitutions
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>
                            Fluency exercises to improve writing dynamics and
                            reduce cognitive load
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>
                            Track progress with regular handwriting samples
                            (bi-weekly recommended)
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Resources</h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Dyslexia Exercise Pack
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Parent/Teacher Guide
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-muted/30 px-6 py-4">
              <div className="w-full text-center text-sm text-muted-foreground">
                <p>
                  This analysis is for educational purposes only and is not a
                  medical diagnosis.
                </p>
                <p>
                  Always consult with qualified professionals for formal
                  assessment.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
