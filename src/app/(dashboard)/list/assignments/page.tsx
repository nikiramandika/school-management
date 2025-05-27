"use server"

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { AssignmentTable } from "./assignment-table";

const AssignmentListPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // ROLE CONDITIONS
  const query: Prisma.AssignmentWhereInput = {};
  query.lesson = {};

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

  const data = await prisma.assignment.findMany({
    where: query,
    include: {
      lesson: {
        select: {
          id: true,
          name: true,
          subject: { select: { name: true } },
          teacher: { select: { name: true, surname: true } },
          class: { select: { name: true } },
        },
      },
    },
  });

  // Fetch all lessons for the form
  const allLessons = await prisma.lesson.findMany({
    where: {
      ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true
        }
      },
      class: {
        select: {
          id: true,
          name: true
        }
      },
      teacher: {
        select: {
          id: true,
          name: true,
          surname: true
        }
      }
    }
  });

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Daftar Tugas</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            {(role === "admin" || role === "teacher") && (
              <FormContainer 
                table="assignment" 
                type="create" 
                relatedData={{
                  lessons: allLessons
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <AssignmentTable 
        data={data} 
        role={role} 
        allLessons={allLessons}
      />
    </div>
  );
};

export default AssignmentListPage; 