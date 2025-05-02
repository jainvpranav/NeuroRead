"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { UserNav } from "@/components/user-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import axios from "axios";
import router from "next/router";

export function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{
    user_id: Number;
    name: string;
    profile_pic_link: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const res = await axios.get("/api/auth/cookies");
        if (res.status === 200) {
          setUser(JSON.parse(res.data.user.value).user);
          setIsLoggedIn(true);
        } else {
          router.push("/login");
        }
      } catch (err: any) {
        // console.error("Error");
      }
    };
    getUserDetails();
    // Add scroll event listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center">
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div className="size-8 rounded-lg gradient-bg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">NeuroRead</span>
        </Link>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden ml-auto">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-4 mt-8">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" passHref>
                    <Button
                      variant={pathname === "/dashboard" ? "default" : "ghost"}
                      className="justify-start w-full"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/history" passHref>
                    <Button
                      variant={pathname === "/history" ? "default" : "ghost"}
                      className="justify-start w-full"
                    >
                      History
                    </Button>
                  </Link>
                  <Link href="/community" passHref>
                    <Button
                      variant={pathname === "/community" ? "default" : "ghost"}
                      className="justify-start w-full"
                    >
                      Community
                    </Button>
                  </Link>
                  <Link href="/games" passHref>
                    <Button
                      variant={pathname === "/games" ? "default" : "ghost"}
                      className="justify-start w-full"
                    >
                      Games
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={async () => {
                      const res = await axios.delete("/api/auth/cookies");
                      window.location.href = "/login";
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" passHref>
                    <Button
                      variant={pathname === "/login" ? "default" : "ghost"}
                      className="justify-start w-full"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" passHref>
                    <Button
                      variant={pathname === "/signup" ? "default" : "ghost"}
                      className="justify-start w-full"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center gap-1">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" passHref>
                <Button
                  variant={pathname === "/dashboard" ? "default" : "ghost"}
                  className="rounded-full"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/history" passHref>
                <Button
                  variant={pathname === "/history" ? "default" : "ghost"}
                  className="rounded-full"
                >
                  History
                </Button>
              </Link>
              <Link href="/community" passHref>
                <Button
                  variant={pathname === "/community" ? "default" : "ghost"}
                  className="rounded-full"
                >
                  Community
                </Button>
              </Link>
              <Link href="/games" passHref>
                <Button
                  variant={pathname === "/games" ? "default" : "ghost"}
                  className="rounded-full"
                >
                  Games
                </Button>
              </Link>
              <UserNav />
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button
                  variant={pathname === "/login" ? "default" : "ghost"}
                  className="rounded-full"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup" passHref>
                <Button
                  variant={pathname === "/signup" ? "default" : "ghost"}
                  className="rounded-full"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
