import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, FileText, BookOpen, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Class, Lesson, Result, Student, Teacher, Grade, Exam, Assignment } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const ClassPage = async ({ params }: ClassPageProps) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Fetch class details with students and their results
  const classData = await prisma.class.findUnique({
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
              results: true
            }
          },
          assignments: {
            include: {
              results: true
            }
          }
        },
      },
    },
  }) as ClassWithRelations | null;

  if (!classData) {
    redirect("/list/results");
  }

  // Check if user has access to this class
  if (role !== "admin") {
    const hasAccess = classData.supervisorId === currentUserId || 
      classData.lessons.some(lesson => lesson.teacherId === currentUserId);
    
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
  const lessonsWithResults: LessonWithResults[] = classData.lessons.map(lesson => {
    const examResults = lesson.exams.flatMap(exam => 
      exam.results.map(result => ({
        ...result,
        exam
      }))
    );
    const assignmentResults = lesson.assignments.flatMap(assignment => 
      assignment.results.map(result => ({
        ...result,
        assignment
      }))
    );
    
    return {
      ...lesson,
      examResults,
      assignmentResults,
    };
  });

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      <div className="bg-card rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {classData.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-white">
                Tingkat {classData.grade?.level}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/list/results">
                Kembali
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-6 py-5">
          <Tabs defaultValue="exam" className="space-y-4">
            <TabsList>
              <TabsTrigger value="exam" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Ujian
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tugas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="exam">
              <div className="space-y-4">
                {lessonsWithResults.some(l => l.examResults.length > 0) ? (
                  <Accordion type="single" collapsible className="w-full">
                    {lessonsWithResults
                      .filter(lesson => lesson.examResults.length > 0)
                      .map((lesson) => (
                        <AccordionItem key={lesson.id} value={lesson.id.toString()}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span className="font-medium">{lesson.name}</span>
                              <span className="text-sm text-muted-foreground">
                                - {lesson.teacher.name} {lesson.teacher.surname}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {lesson.exams.map((exam) => (
                                <Card key={exam.id}>
                                  <CardHeader>
                                    <CardTitle className="text-base">{exam.title}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nama Siswa</TableHead>
                                          <TableHead>Nilai</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {exam.results.map((result) => (
                                          <TableRow key={result.id}>
                                            <TableCell>
                                              {classData.students.find(s => s.id === result.studentId)?.name}
                                            </TableCell>
                                            <TableCell>{result.score}</TableCell>
                                          </TableRow>
                                        ))}
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
                  <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada nilai ujian yang tersedia</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="assignment">
              <div className="space-y-4">
                {lessonsWithResults.some(l => l.assignmentResults.length > 0) ? (
                  <Accordion type="single" collapsible className="w-full">
                    {lessonsWithResults
                      .filter(lesson => lesson.assignmentResults.length > 0)
                      .map((lesson) => (
                        <AccordionItem key={lesson.id} value={lesson.id.toString()}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span className="font-medium">{lesson.name}</span>
                              <span className="text-sm text-muted-foreground">
                                - {lesson.teacher.name} {lesson.teacher.surname}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              {lesson.assignments.map((assignment) => (
                                <Card key={assignment.id}>
                                  <CardHeader>
                                    <CardTitle className="text-base">{assignment.title}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nama Siswa</TableHead>
                                          <TableHead>Nilai</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {assignment.results.map((result) => (
                                          <TableRow key={result.id}>
                                            <TableCell>
                                              {classData.students.find(s => s.id === result.studentId)?.name}
                                            </TableCell>
                                            <TableCell>{result.score}</TableCell>
                                          </TableRow>
                                        ))}
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
                  <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada nilai tugas yang tersedia</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClassPage; 