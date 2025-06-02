"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  User,
  Award,
  Calendar,
  GraduationCap,
  UserCheck,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
};

type ResultTableProps = {
  data: ResultList[];
  role?: string;
  relatedData?: {
    classes: { id: string; name: string }[];
    students: {
      id: string;
      name: string;
      surname: string;
      className: string;
    }[];
    exams: {
      id: string;
      title: string;
      className: string;
      lesson: {
        class: { name: string };
        teacher: { name: string; surname: string };
      };
    }[];
    assignments: {
      id: string;
      title: string;
      className: string;
      lesson: {
        class: { name: string };
        teacher: { name: string; surname: string };
      };
    }[];
  };
};

export function ResultTable({ data, role, relatedData }: ResultTableProps) {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Get unique classes from data
  const availableClasses = Array.from(
    new Set(data.map((item) => item.className))
  ).map((className) => ({ id: className, name: className }));

  // Filter and sort data
  const filteredData = data
    .filter((item) => {
      const matchesClass = !selectedClass || item.className === selectedClass;
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${item.studentName} ${item.studentSurname}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        `${item.teacherName} ${item.teacherSurname}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "score":
          aValue = a.score;
          bValue = b.score;
          break;
        case "student":
          aValue = `${a.studentName} ${a.studentSurname}`;
          bValue = `${b.studentName} ${b.studentSurname}`;
          break;
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate statistics
  const totalResults = filteredData.length;
  const averageScore =
    totalResults > 0
      ? (
          filteredData.reduce((sum, item) => sum + item.score, 0) / totalResults
        ).toFixed(1)
      : 0;
  const highestScore =
    totalResults > 0 ? Math.max(...filteredData.map((item) => item.score)) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90)
      return "border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/20";
    if (score >= 80)
      return "border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-900/20";
    if (score >= 70)
      return "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-900/20";
    if (score >= 60)
      return "border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-900/20";
    return "border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return "🏆";
    if (score >= 80) return "🥇";
    if (score >= 70) return "🥈";
    if (score >= 60) return "🥉";
    return "📝";
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-purple-200 dark:border-purple-800">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manajemen Nilai
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Kelola dan pantau hasil nilai siswa
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Nilai
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalResults}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rata-rata
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {averageScore}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tertinggi
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {highestScore}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[200px] border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kelas</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        {cls.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-600" />
              <Input
                placeholder="Cari siswa, judul, atau guru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px] border-indigo-200 focus:border-indigo-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-green-600" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] border-green-200 focus:border-green-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Tanggal</SelectItem>
                  <SelectItem value="score">Nilai</SelectItem>
                  <SelectItem value="student">Siswa</SelectItem>
                  <SelectItem value="title">Judul</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  Daftar Nilai Siswa
                </h3>
                <Badge
                  variant="outline"
                  className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300"
                >
                  {filteredData.length} Hasil
                </Badge>
              </div>
              {(role === "admin" || role === "teacher") && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center justify-center">
                        <FormModal
                          table="result"
                          type="create"
                          relatedData={relatedData}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Tambah Nilai Baru</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Table Content */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.map((result, index) => {
              const exam = relatedData?.exams.find(
                (e: any) => e.title === result.title
              );
              const assignment = relatedData?.assignments.find(
                (a: any) => a.title === result.title
              );
              const student = relatedData?.students.find(
                (s: any) =>
                  `${s.name} ${s.surname}` ===
                  `${result.studentName} ${result.studentSurname}`
              );

              const formData = {
                ...result,
                studentId: student?.id,
                examId: exam?.id,
                assignmentId: assignment?.id,
              };

              return (
                <div
                  key={result.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    index % 2 === 0
                      ? "bg-white dark:bg-card"
                      : "bg-gray-50/50 dark:bg-gray-800/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Main Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-gray-900 dark:text-white truncate">
                            {result.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300 text-xs"
                            >
                              <User className="mr-1 h-3 w-3" />
                              {result.studentName} {result.studentSurname}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300 text-xs"
                            >
                              <Users className="mr-1 h-3 w-3" />
                              {result.className}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 text-xs"
                            >
                              <UserCheck className="mr-1 h-3 w-3" />
                              {result.teacherName} {result.teacherSurname}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score and Actions */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${getScoreColor(
                            result.score
                          )} font-bold text-lg px-3 py-1`}
                        >
                          {getScoreIcon(result.score)} {result.score}
                        </Badge>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(result.startTime).toLocaleString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      {(role === "admin" || role === "teacher") && (
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center justify-center">
                                  <FormModal
                                    table="result"
                                    type="update"
                                    data={formData}
                                    relatedData={relatedData}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Edit Nilai</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center justify-center">
                                  <FormModal
                                    table="result"
                                    type="delete"
                                    id={result.id}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Hapus Nilai</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Award className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {searchQuery || selectedClass
                      ? "Tidak ada hasil yang ditemukan"
                      : "Belum ada nilai"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {searchQuery || selectedClass
                      ? "Coba ubah filter atau kata kunci pencarian"
                      : "Belum ada nilai yang tercatat untuk siswa"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
