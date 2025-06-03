import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  FileText,
  UserCheck,
  BookOpen,
  ArrowLeft,
  Users,
  BookOpenCheck,
  TrendingUp,
  Award,
  GraduationCap,
  School,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Class,
  Lesson,
  Result,
  Student,
  Teacher,
  Grade,
  Exam,
  Assignment,
} from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HiAcademicCap } from "react-icons/hi";

interface ClassPageProps {
  params: {
    classId: string;
  };
}

type ResultWithTimestamp = Result & {
  updatedAt: Date;
  exam?: Exam;
  assignment?: Assignment;
};

type ClassWithRelations = Class & {
  supervisor: Teacher | null;
  grade: Grade | null;
  students: Student[];
  lessons: (Lesson & {
    teacher: Teacher;
    exams: (Exam & {
      results: ResultWithTimestamp[];
    })[];
    assignments: (Assignment & {
      results: ResultWithTimestamp[];
    })[];
  })[];
};

type LessonWithResults = Lesson & {
  teacher: Teacher;
  examResults: ResultWithTimestamp[];
  assignmentResults: ResultWithTimestamp[];
  exams: (Exam & {
    results: ResultWithTimestamp[];
  })[];
  assignments: (Assignment & {
    results: ResultWithTimestamp[];
  })[];
};

// Enhanced Header component with stats
const PageHeader = ({
  className,
  gradeLevel,
  totalStudents,
  totalExams,
  totalAssignments,
  totalLessons,
  role,
}: {
  className: string;
  gradeLevel: number | null;
  totalStudents: number;
  totalExams: number;
  totalAssignments: number;
  totalLessons: number;
  role: string;
}) => (
  <div className="space-y-6">
    {/* Navigation Breadcrumb */}
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Link
        href="/list/results"
        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Kelas
      </Link>
    </div>

    {/* Main Header */}
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-500  rounded-lg">
          <Award className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hasil Belajar {className}
          </h1>
        </div>
      </div>
    </div>
  </div>
);

const ClassPage = async ({ params }: ClassPageProps) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Fetch class details with students and their results
  const classData = (await prisma.class.findUnique({
    where: {
      id: parseInt(params.classId),
    },
    include: {
      supervisor: true,
      grade: true,
      students: true,
      lessons: {
        include: {
          teacher: true,
          exams: {
            include: {
              results: true,
            },
          },
          assignments: {
            include: {
              results: true,
            },
          },
        },
      },
    },
  })) as ClassWithRelations | null;

  if (!classData) {
    redirect("/list/results");
  }

  // Check if user has access to this class
  if (role !== "admin") {
    const hasAccess =
      classData.supervisorId === currentUserId ||
      classData.lessons.some((lesson) => lesson.teacherId === currentUserId);

    if (!hasAccess) {
      redirect("/list/results");
    }
  }

  const isSupervisor = classData.supervisorId === currentUserId;

  // If user is not supervisor, redirect to the original exam page
  if (!isSupervisor) {
    redirect(`/list/results/${params.classId}/exam`);
  }

  // Group results by lesson
  const lessonsWithResults: LessonWithResults[] = classData.lessons.map(
    (lesson) => {
      const examResults = lesson.exams.flatMap((exam) =>
        exam.results.map((result) => ({
          ...result,
          exam,
        }))
      );
      const assignmentResults = lesson.assignments.flatMap((assignment) =>
        assignment.results.map((result) => ({
          ...result,
          assignment,
        }))
      );

      return {
        ...lesson,
        examResults,
        assignmentResults,
      };
    }
  );

  // Calculate statistics
  const totalStudents = classData.students.length;
  const totalLessons = classData.lessons.length;
  const totalExams = classData.lessons.reduce(
    (sum, lesson) => sum + lesson.exams.length,
    0
  );
  const totalAssignments = classData.lessons.reduce(
    (sum, lesson) => sum + lesson.assignments.length,
    0
  );

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          className={classData.name}
          gradeLevel={classData.grade?.level || null}
          totalStudents={totalStudents}
          totalExams={totalExams}
          totalAssignments={totalAssignments}
          totalLessons={totalLessons}
          role={role || ""}
        />

        {/* Main Content Section */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-800 rounded-xl">
          <CardContent className="p-0 bg-gray-100 dark:bg-slate-700 rounded-xl">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-600 p-6">
              <Tabs defaultValue="exam" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                  <TabsTrigger
                    value="exam"
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 rounded-md px-4 py-2"
                  >
                    <BarChart2 className="h-4 w-4" />
                    Ujian
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-cyan-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                    >
                      {totalExams}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="assignment"
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 rounded-md px-4 py-2"
                  >
                    <FileText className="h-4 w-4" />
                    Tugas
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-cyan-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                    >
                      {totalAssignments}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="exam" className="space-y-6">
                  {lessonsWithResults.some((l) => l.examResults.length > 0) ? (
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full space-y-4"
                    >
                      {lessonsWithResults
                        .filter((lesson) => lesson.examResults.length > 0)
                        .map((lesson) => (
                          <AccordionItem
                            key={lesson.id}
                            value={lesson.id.toString()}
                            className="border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800"
                          >
                            <AccordionTrigger className="hover:no-underline px-6 py-4">
                              <div className="flex items-center gap-3 text-left">
                                <div className="p-2 bg-cyan-500  rounded-lg">
                                  <BarChart2 className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {lesson.name}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 justify-center"
                                    >
                                      <HiAcademicCap className="mr-2 h-4 w-4 text-orange-600" />
                                      {lesson.teacher.name}{" "}
                                      {lesson.teacher.surname}
                                    </Badge>
                                  </div>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                  {lesson.exams.length} Ujian
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                              <div className="space-y-4">
                                {lesson.exams.map((exam) => (
                                  <Card
                                    key={exam.id}
                                    className="border border-gray-100 dark:border-slate-700"
                                  >
                                    <CardHeader className="bg-gray-50 dark:bg-slate-700/50 rounded-t-lg">
                                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                          <Award className="h-4 w-4 text-teal-600" />
                                          {exam.title}
                                        </CardTitle>
                                        <Badge className="bg-cyan-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                          {exam.results.length} Hasil
                                        </Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-gray-50 dark:bg-slate-700/30">
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                                              Nama Siswa
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                                              Nilai
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {exam.results.length > 0 ? (
                                            exam.results.map((result) => (
                                              <TableRow
                                                key={result.id}
                                                className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                              >
                                                <TableCell className="font-medium">
                                                  {
                                                    classData.students.find(
                                                      (s) =>
                                                        s.id ===
                                                        result.studentId
                                                    )?.name
                                                  }
                                                </TableCell>
                                                <TableCell>
                                                  <Badge
                                                    variant={
                                                      result.score >= 75
                                                        ? "default"
                                                        : result.score >= 60
                                                        ? "secondary"
                                                        : "destructive"
                                                    }
                                                    className="font-semibold"
                                                  >
                                                    {result.score}
                                                  </Badge>
                                                </TableCell>
                                              </TableRow>
                                            ))
                                          ) : (
                                            <TableRow>
                                              <TableCell
                                                colSpan={2}
                                                className="text-center py-8 text-gray-500"
                                              >
                                                Belum ada hasil ujian
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  ) : (
                    <Card className="border-2 border-dashed border-gray-300 dark:border-slate-600">
                      <CardContent className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-full">
                            <BarChart2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              Belum Ada Nilai Ujian
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                              Belum ada nilai ujian yang tersedia untuk kelas
                              ini
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="assignment" className="space-y-6">
                  {lessonsWithResults.some(
                    (l) => l.assignmentResults.length > 0
                  ) ? (
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full space-y-4"
                    >
                      {lessonsWithResults
                        .filter((lesson) => lesson.assignmentResults.length > 0)
                        .map((lesson) => (
                          <AccordionItem
                            key={lesson.id}
                            value={lesson.id.toString()}
                            className="border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-800"
                          >
                            <AccordionTrigger className="hover:no-underline px-6 py-4">
                              <div className="flex items-center gap-3 text-left">
                                <div className="p-2 bg-orange-500 rounded-lg">
                                  <FileText className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {lesson.name}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 justify-center"
                                    >
                                      <HiAcademicCap className="mr-2 h-4 w-4 text-orange-600" />
                                      {lesson.teacher.name}{" "}
                                      {lesson.teacher.surname}
                                    </Badge>
                                  </div>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                  {lesson.assignments.length} Tugas
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                              <div className="space-y-4">
                                {lesson.assignments.map((assignment) => (
                                  <Card
                                    key={assignment.id}
                                    className="border border-gray-100 dark:border-slate-700"
                                  >
                                    <CardHeader className="bg-gray-50 dark:bg-slate-700/50 rounded-t-lg">
                                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                          <Award className="h-4 w-4 text-teal-600" />
                                          {assignment.title}
                                        </CardTitle>
                                        <Badge className="bg-cyan-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                                          {assignment.results.length} Hasil
                                        </Badge>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-gray-50 dark:bg-slate-700/30">
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                                              Nama Siswa
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                                              Nilai
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {assignment.results.length > 0 ? (
                                            assignment.results.map((result) => (
                                              <TableRow
                                                key={result.id}
                                                className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                              >
                                                <TableCell className="font-medium">
                                                  {
                                                    classData.students.find(
                                                      (s) =>
                                                        s.id ===
                                                        result.studentId
                                                    )?.name
                                                  }
                                                </TableCell>
                                                <TableCell>
                                                  <Badge
                                                    variant={
                                                      result.score >= 75
                                                        ? "default"
                                                        : result.score >= 60
                                                        ? "secondary"
                                                        : "destructive"
                                                    }
                                                    className="font-semibold"
                                                  >
                                                    {result.score}
                                                  </Badge>
                                                </TableCell>
                                              </TableRow>
                                            ))
                                          ) : (
                                            <TableRow>
                                              <TableCell
                                                colSpan={2}
                                                className="text-center py-8 text-gray-500"
                                              >
                                                Belum ada hasil tugas
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  ) : (
                    <Card className="border-2 border-dashed border-gray-300 dark:border-slate-600">
                      <CardContent className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-full">
                            <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              Belum Ada Nilai Tugas
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                              Belum ada nilai tugas yang tersedia untuk kelas
                              ini
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

export default ClassPage;
