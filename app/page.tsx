import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Brain, FileText, BarChart3, History, ArrowRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 pattern-bg overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-fit border-primary/20 bg-primary/10 text-primary">
                    Innovative Dyslexia Assessment
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Analyze Handwriting for <span className="gradient-text">Dyslexia Indicators</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    NeuroRead helps teachers and parents identify potential dyslexia indicators through advanced
                    handwriting analysis.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup" passHref>
                    <Button size="lg" className="rounded-full gradient-bg">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login" passHref>
                    <Button size="lg" variant="outline" className="rounded-full">
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-neuro-500/20 to-read-500/20 rounded-full blur-3xl animate-pulse-slow" />
                  <div className="relative animate-float">
                    <Brain className="h-64 w-64 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <Badge variant="outline" className="w-fit">
                How It Works
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple Process, <span className="gradient-text">Powerful Insights</span>
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our advanced algorithm analyzes handwriting samples to identify potential dyslexia indicators using
                scientifically validated metrics.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-neuro-50 dark:from-gray-900 dark:to-gray-800">
                <div className="absolute top-0 left-0 h-1 w-full gradient-bg" />
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full gradient-bg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Upload</h3>
                    <p className="text-muted-foreground">
                      Upload a clear image of the student's handwriting sample. Our system works with various
                      handwriting styles.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-neuro-50 dark:from-gray-900 dark:to-gray-800">
                <div className="absolute top-0 left-0 h-1 w-full gradient-bg" />
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full gradient-bg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Analyze</h3>
                    <p className="text-muted-foreground">
                      Our AI algorithm analyzes motor variability, orthographic irregularities, and writing dynamics
                      with clinical-grade precision.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-neuro-50 dark:from-gray-900 dark:to-gray-800">
                <div className="absolute top-0 left-0 h-1 w-full gradient-bg" />
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full gradient-bg">
                    <History className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Track</h3>
                    <p className="text-muted-foreground">
                      View detailed results and track progress over time with comprehensive historical data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <Badge variant="outline" className="w-fit">
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comprehensive <span className="gradient-text">Analysis Tools</span>
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                NeuroRead provides detailed metrics and insights to help identify dyslexia indicators.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      title: "Motor Variability Analysis",
                      description:
                        "Detects inconsistencies in stroke patterns, pressure, and spacing during handwriting.",
                    },
                    {
                      title: "Orthographic Irregularity Detection",
                      description: "Identifies spelling errors, letter reversals, substitutions, and omissions.",
                    },
                    {
                      title: "Writing Dynamics Assessment",
                      description: "Analyzes in-air pen duration and writing speed influenced by cognitive load.",
                    },
                    {
                      title: "Progress Tracking",
                      description: "Monitor improvements over time with historical comparisons.",
                    },
                  ].map((feature, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-bg">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-neuro-500/20 to-read-500/20 rounded-xl blur-xl" />
                <div className="relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden border">
                  <div className="h-10 bg-muted flex items-center gap-2 px-4">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="p-4">
                    <div className="rounded-lg overflow-hidden border">
                      <img
                        src="/placeholder.svg?height=300&width=600"
                        alt="NeuroRead Dashboard Preview"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-4 bg-muted rounded-full w-3/4" />
                      <div className="h-4 bg-muted rounded-full w-1/2" />
                      <div className="h-4 bg-muted rounded-full w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <Badge variant="outline" className="w-fit mx-auto">
                  Get Started Today
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to <span className="gradient-text">Transform</span> How You Assess Dyslexia?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Join thousands of educators and parents who are using NeuroRead to identify dyslexia indicators early
                  and provide targeted support.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 min-[400px]:flex-row w-full max-w-md">
                <Link href="/signup" passHref className="w-full">
                  <Button size="lg" className="w-full rounded-full gradient-bg">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/login" passHref className="w-full">
                  <Button size="lg" variant="outline" className="w-full rounded-full">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0 bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg gradient-bg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">© 2024 NeuroRead. All rights reserved.</p>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

