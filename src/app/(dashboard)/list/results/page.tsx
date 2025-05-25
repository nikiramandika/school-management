import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { ResultTable } from "./result-table";

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Fetch all students, exams, and assignments for the form
  const [students, exams, assignments] = await prisma.$transaction([
    prisma.student.findMany({
      select: { id: true, name: true, surname: true },
    }),
    prisma.exam.findMany({
      select: { 
        id: true, 
        title: true,
        lesson: {
          select: {
            class: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
          }
        }
      },
    }),
    prisma.assignment.findMany({
      select: { 
        id: true, 
        title: true,
        lesson: {
          select: {
            class: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
          }
        }
      },
    }),
  ]);

  // URL PARAMS CONDITION
  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { 
          exam: { 
            lesson: { 
              teacherId: currentUserId! 
            } 
          } 
        },
        { 
          assignment: { 
            lesson: { 
              teacherId: currentUserId! 
            } 
          } 
        }
      ];
      break;

    case "student":
      query.studentId = currentUserId!;
      break;

    default:
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes.map((item) => {
    const assessment = item.exam || item.assignment;

    if (!assessment) return null;

    const isExam = "startTime" in assessment;

    return {
      id: item.id,
      title: assessment.title,
      studentName: item.student.name,
      studentSurname: item.student.surname,
      teacherName: assessment.lesson.teacher.name,
      teacherSurname: assessment.lesson.teacher.surname,
      score: item.score,
      className: assessment.lesson.class.name,
      startTime: isExam ? assessment.startTime : assessment.startDate,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">

            {(role === "admin" || role === "teacher") && (
              <FormContainer 
                table="result" 
                type="create" 
                relatedData={{
                  students,
                  exams,
                  assignments,
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <ResultTable 
        data={data} 
        role={role}
        relatedData={{
          students: students.map(student => ({
            ...student,
            id: student.id.toString()
          })),
          exams: exams.map(exam => ({
            ...exam,
            id: exam.id.toString()
          })),
          assignments: assignments.map(assignment => ({
            ...assignment,
            id: assignment.id.toString()
          }))
        }}
      />
    </div>
  );
};

export default ResultListPage;
