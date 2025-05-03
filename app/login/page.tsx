"use client";

import type React from "react";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Loader2, Mail, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import PageLoader from "@/components/ui/page-loader";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      console.log("checking if the user is present");
      const cookies = await axios.get("api/auth/cookies");
      console.log(cookies);
      if (cookies.data.user) {
        router.push("/dashboard");
        return;
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });
      if (res.status === 200) {
        router.refresh();
        router.push("/dashboard");
      } else if (res.status === 401) {
        router.push("/login");
      }
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };
  if (isLoading) {
    return <PageLoader />;
  } else {
    return (
      <Suspense fallback={<PageLoader />}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-4 md:p-8 pattern-bg">
            <div className="w-full max-w-md">
              <Tabs defaultValue="login" className="w-full">
                {/* <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup" onClick={() => router.push("/signup")}>
                  Sign Up
                </TabsTrigger>
              </TabsList> */}
                <TabsContent value="login">
                  <Card className="border-none shadow-lg">
                    <CardHeader className="space-y-1 flex flex-col items-center">
                      <div className="size-12 rounded-full gradient-bg flex items-center justify-center mb-2">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold">
                        Welcome back
                      </CardTitle>
                      <CardDescription>
                        Enter your credentials to access your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                              href="/forgot-password"
                              className="text-sm text-primary hover:underline"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full gradient-bg"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <div className="text-center text-sm text-muted-foreground mt-2">
                        Don&apos;t have an account?{" "}
                        <Link
                          href="/signup"
                          className="text-primary hover:underline"
                        >
                          Sign up
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </Suspense>
    );
  }
}
