import { Loader2, Brain } from "lucide-react";

export default function PageLoader() {
  console.log("this is the page loader");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center pattern-bg p-4">
      <div className="size-16 rounded-full gradient-bg flex items-center justify-center mb-4 shadow-lg">
        <Brain className="h-8 w-8 text-white animate-pulse" />
      </div>
      <div className="flex items-center space-x-2 text-muted-foreground text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading, please wait...</span>
      </div>
    </div>
  );
}
