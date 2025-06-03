import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Trophy } from "lucide-react";
import { notFound } from "next/navigation";

const StudentGradesPage = async () => {
  const { userId } = await auth();
  if (!userId) notFound();

  // Get student data
  const student = await prisma.student.findUnique({
    where: { id: userId },
    include: {
      class: true,
      results: {
        include: {
          exam: {
            include: {
              lesson: {
                include: {
                  teacher: true,
                  class: true,
                  subject: true,
                },
              },
            },
          },
          assignment: {
            include: {
              lesson: {
                include: {
                  teacher: true,
                  class: true,
                  subject: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) notFound();

  // Separate exam and assignment results
  const examResults = student.results.filter(result => result.examId !== null);
  const assignmentResults = student.results.filter(result => result.assignmentId !== null);

  // Calculate average scores
  const examAverage = examResults.length > 0
    ? examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length
    : 0;
  const assignmentAverage = assignmentResults.length > 0
    ? assignmentResults.reduce((sum, result) => sum + result.score, 0) / assignmentResults.length
    : 0;

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Nilai Saya
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Lihat dan pantau perkembangan nilai Anda
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Rata-rata Nilai Ujian
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {examAverage.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Rata-rata Nilai Tugas
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {assignmentAverage.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Tabs */}
        <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
          <CardContent className="bg-gray-100 dark:bg-transparent rounded-xl p-0">
            <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
              <Tabs defaultValue="exams" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="exams">Ujian</TabsTrigger>
                  <TabsTrigger value="assignments">Tugas</TabsTrigger>
                </TabsList>

                <TabsContent value="exams">
                  {examResults.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mata Pelajaran</TableHead>
                          <TableHead>Judul Ujian</TableHead>
                          <TableHead>Guru</TableHead>
                          <TableHead>Nilai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>{result.exam?.lesson.subject.name}</TableCell>
                            <TableCell>{result.exam?.title}</TableCell>
                            <TableCell>
                              {result.exam?.lesson.teacher.name} {result.exam?.lesson.teacher.surname}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`px-3 py-1 text-base font-semibold ${
                                  result.score >= 80
                                    ? "border-teal-200 text-teal-700 bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:bg-teal-900/20"
                                    : result.score >= 70
                                    ? "border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:bg-blue-900/20"
                                    : result.score >= 60
                                    ? "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-900/20"
                                    : "border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20"
                                }`}
                              >
                                {result.score}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Belum ada hasil ujian
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="assignments">
                  {assignmentResults.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mata Pelajaran</TableHead>
                          <TableHead>Judul Tugas</TableHead>
                          <TableHead>Guru</TableHead>
                          <TableHead>Nilai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignmentResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>{result.assignment?.lesson.subject.name}</TableCell>
                            <TableCell>{result.assignment?.title}</TableCell>
                            <TableCell>
                              {result.assignment?.lesson.teacher.name} {result.assignment?.lesson.teacher.surname}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`px-3 py-1 text-base font-semibold ${
                                  result.score >= 80
                                    ? "border-teal-200 text-teal-700 bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:bg-teal-900/20"
                                    : result.score >= 70
                                    ? "border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:bg-blue-900/20"
                                    : result.score >= 60
                                    ? "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-900/20"
                                    : "border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20"
                                }`}
                              >
                                {result.score}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Belum ada hasil tugas
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentGradesPage; 