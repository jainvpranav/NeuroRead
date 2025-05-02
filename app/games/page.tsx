"use client";

import { Navbar } from "@/components/navbar";
import PageLoader from "@/components/ui/page-loader";
import { Suspense } from "react";

export default function GamesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
      </div>
    </Suspense>
  );
}
