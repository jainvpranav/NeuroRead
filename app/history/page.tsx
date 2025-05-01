"use client";

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
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Download,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

type Analysis = {
  diagnose_id: string;
  studentName: string;
  diagnosed_at: string;
  image_uploaded_link: string;
  dyslexia_risk_score: number;
  results: {
    motorVariability: number;
    orthographicIrregularity: number;
    writingDynamics: number;
  };
};

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    user_id: Number;
    name: string;
    profile_pic_link: string;
    email: string;
    role: string;
  } | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<"date" | "score" | "name">("date");
  const [language, setLanguage] = useState("en");

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
    const diagnosis = async () => {
      const res = await axios.get("/api/history");
      if (res.status === 200) {
        setHistory(res.data.diagnosis);
      } else setHistory([]);
    };
    getUserDetails();
    diagnosis();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRiskLevelClass = (score: number) => {
    if (score < 30) return "text-green-500";
    if (score < 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskLevelBadge = (score: number) => {
    if (score < 30)
      return {
        text: "Low Risk",
        color: "bg-green-500/10 text-green-500 border-green-500/20",
      };
    if (score < 70)
      return {
        text: "Moderate Risk",
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      };
    return {
      text: "High Risk",
      color: "bg-red-500/10 text-red-500 border-red-500/20",
    };
  };

  const deleteAnalysis = (id: string) => {
    const updatedHistory = history.filter((item) => item.diagnose_id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("analysisHistory", JSON.stringify(updatedHistory));
  };

  const filteredAndSortedHistory = [...history]
    .filter((item) =>
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.diagnosed_at).getTime() -
              new Date(b.diagnosed_at).getTime()
          : new Date(b.diagnosed_at).getTime() -
              new Date(a.diagnosed_at).getTime();
      } else if (sortBy === "score") {
        return sortOrder === "asc"
          ? a.dyslexia_risk_score - b.dyslexia_risk_score
          : b.dyslexia_risk_score - a.dyslexia_risk_score;
      } else {
        return sortOrder === "asc"
          ? a.studentName.localeCompare(b.studentName)
          : b.studentName.localeCompare(a.studentName);
      }
    });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analysis History</h1>
            <p className="text-muted-foreground">
              View and manage all previous handwriting analyses
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            className="gradient-bg rounded-full"
          >
            New Analysis
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="bg-muted/50">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <CardTitle>Previous Analyses</CardTitle>
                <CardDescription>
                  {filteredAndSortedHistory.length} total records
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by student name..."
                    className="pl-8 rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as any)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Language Selector */}
          <div className="px-6 py-4 flex items-center gap-2">
            <span className="text-sm font-medium">View in:</span>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
                <SelectItem value="ml">Malayalam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CardContent className="p-0">
            {filteredAndSortedHistory.length > 0 ? (
              <div className="rounded-b-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Dyslexia Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedHistory.map((item) => {
                      const riskBadge = getRiskLevelBadge(
                        item.dyslexia_risk_score
                      );
                      return (
                        <TableRow
                          key={item.diagnose_id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {item.studentName}
                          </TableCell>
                          <TableCell>{formatDate(item.diagnosed_at)}</TableCell>
                          <TableCell>
                            <span
                              className={getRiskLevelClass(
                                item.dyslexia_risk_score
                              )}
                            >
                              {item.dyslexia_risk_score}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={riskBadge.color}
                            >
                              {riskBadge.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  router.push(`/results/${item.diagnose_id}`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <svg
                                      width="15"
                                      height="15"
                                      viewBox="0 0 15 15"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                    >
                                      <path
                                        d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                      ></path>
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/results/${item.diagnose_id}`
                                      )
                                    }
                                  >
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Export as PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Share report
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                      deleteAnalysis(item.diagnose_id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete record
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                {searchTerm ? (
                  <div className="space-y-2">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      No results found for "{searchTerm}"
                    </p>
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        No analysis history found
                      </p>
                      <p className="text-muted-foreground mb-4">
                        Upload your first handwriting sample to get started
                      </p>
                      <Link href="/dashboard" passHref>
                        <Button className="gradient-bg rounded-full">
                          Upload Your First Sample
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
