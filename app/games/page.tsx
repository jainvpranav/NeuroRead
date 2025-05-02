"use client";

import PageLoader from "@/components/ui/page-loader";
import { Suspense } from "react";

export default function GamesPage() {
  return <Suspense fallback={<PageLoader />}></Suspense>;
}
