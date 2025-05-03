"use client";

import { useState, useEffect, use, Suspense } from "react";
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
import { Download, ArrowLeft, Info, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import PageLoader from "@/components/ui/page-loader";

// Update the Analysis type to reflect the new metrics
type Analysis = {
  diagnose_id: string;
  studentName: string;
  diagnosed_at: string;
  image_uploaded_link: string;
  dyslexia_risk_score: number;
  key_metrics: {
    motorVariability: number;
    orthographicIrregularity: number;
    writingDynamics: number;
  };
};

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const getData = async () => {
    const formData = new FormData();
    formData.append("diagnosis_id", id);
    const analysis = await axios.post(`/api/results/`, formData);
    console.log(analysis.data[0]);
    setAnalysis(analysis.data[0]);
  };

  const games = [
    {
      title: "Phonics Match",
      description: "Match sounds with letters in this fun phonics game",
      category: "Reading",
      level: "Beginner",
      link: "https://app.lexercise.com/mylexercise/index/index/demo/2c9h67mizr6fhkl8",
      image: "/dyslexia_home_img.jpeg",
    },
    {
      title: "Spelling Sprint",
      description: "Race against time to spell words correctly",
      category: "Spelling",
      level: "Intermediate",
      link: "https://app.lexercise.com/mylexercise/index/index/demo/ll4m2gkogxhzc0zj",
      image: "/dyslexia_home_img.jpeg",
    },
    {
      title: "Word Builder",
      description: "Build words from letters to improve vocabulary",
      category: "Vocabulary",
      level: "Advanced",
      link: "https://app.lexercise.com/mylexercise/index/index/demo/sxpdew5apwhq747m",
      image: "/dyslexia_home_img.jpeg",
    },
  ];

  const [selectedGame, setSelectedGame] = useState<{
    title: string;
    link: string;
  }>();

  useEffect(() => {
    getData();
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

  const risk = getRiskLevel(analysis.dyslexia_risk_score);

  return (
    <Suspense fallback={<PageLoader />}>
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
              {/* <Button variant="outline" size="sm" className="rounded-full">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button> */}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Handwriting Sample</CardTitle>
                    <CardDescription>
                      {analysis.studentName} •{" "}
                      {formatDate(analysis.diagnosed_at)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    Sample #{analysis.diagnose_id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative w-full h-64 mb-4 border rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={analysis.image_uploaded_link || "/placeholder.svg"}
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
                      {analysis.dyslexia_risk_score}%
                    </span>
                  </div>
                  <Progress
                    value={analysis.dyslexia_risk_score}
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
                            {analysis.key_metrics.motorVariability.toFixed(1)}/5
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
                        value={analysis.key_metrics.motorVariability * 20}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Orthographic Irregularity
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">
                            {analysis.key_metrics.orthographicIrregularity.toFixed(
                              1
                            )}
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
                        value={
                          analysis.key_metrics.orthographicIrregularity * 20
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Writing Dynamics</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">
                            {analysis.key_metrics.writingDynamics.toFixed(1)}/5
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[220px] text-xs">
                                  Analyzes in-air pen duration and writing
                                  speed, which are influenced by cognitive load
                                  and spelling deficits in dyslexia.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Progress
                        value={analysis.key_metrics.writingDynamics * 20}
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
                              Orthographic awareness activities to address
                              letter reversals and substitutions
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
          <div className="flex flex-col items-center gap-8 p-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Recommended Games
            </h2>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {games.map((game, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden shadow-md bg-white"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-[220px] object-cover"
                  />
                  <div className="absolute bottom-4 left-4 text-white text-xl font-semibold drop-shadow">
                    {game.title}
                  </div>
                  <button
                    onClick={() => setSelectedGame(game)} // <-- pass selected game to modal
                    className="absolute top-4 right-4 bg-white/80 text-gray-800 text-sm px-3 py-1 rounded-md shadow-sm hover:bg-white transition"
                  >
                    Play Fullscreen
                  </button>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            ></motion.div>
            <AnimatePresence>
              {selectedGame && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative w-full max-w-6xl h-[80vh] bg-white rounded-lg overflow-hidden shadow-xl">
                    <iframe
                      src={
                        "https://app.lexercise.com/mylexercise/index/index/demo/ll4m2gkogxhzc0zj"
                      }
                      title={selectedGame.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                    <button
                      onClick={() => setSelectedGame(undefined)}
                      className="absolute top-3 right-3 bg-white text-gray-800 px-4 py-1 text-sm rounded-md shadow hover:bg-gray-100 transition"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </Suspense>
  );
}
