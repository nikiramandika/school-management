import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { AttendanceTable } from "../attendance-table";
import FormModal from "@/components/FormModal";
import { notFound, redirect } from "next/navigation";

export default async function ClassAttendancePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Get the class
  const classItem = await prisma.class.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      supervisorId: true,
      lessons: {
        select: {
          teacher: {
            select: {
              id: true,
              name: true,
              surname: true
            }
          }
        }
      }
    }
  });

  if (!classItem) {
    return notFound();
  }

  // Check if user has access to this class
  if (role !== "admin" && 
      !classItem.lessons.some(lesson => lesson.teacher.id === currentUserId) &&
      classItem.supervisorId !== currentUserId) {
    notFound();
  }

  // Redirect supervisor to the supervisor view
  if (classItem.supervisorId === currentUserId) {
    redirect(`/list/attendance/${id}/supervisor`);
  }

  // Get all students in this class
  const students = await prisma.student.findMany({
    where: {
      classId: parseInt(id),
    },
    select: {
      id: true,
      name: true,
      surname: true,
      class: {
        select: {
          id: true,
          name: true
        }
      }
    },
  });

  // Get all lessons for this class
  const lessons = await prisma.lesson.findMany({
    where: {
      classId: parseInt(id),
      ...(role !== "admin" ? {
        OR: [
          { teacherId: currentUserId! },
          { class: { supervisorId: currentUserId! } }
        ]
      } : {})
    },
    select: {
      id: true,
      name: true,
      class: {
        select: {
          name: true,
          supervisorId: true,
        },
      },
      teacher: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
  });

  // Get all attendance records for this class
  const attendances = await prisma.attendance.findMany({
    where: {
      lesson: {
        classId: parseInt(id),
        ...(role !== "admin" ? {
          OR: [
            { teacherId: currentUserId! },
            { class: { supervisorId: currentUserId! } }
          ]
        } : {})
      },
    },
    select: {
      id: true,
      date: true,
      present: true,
      studentId: true,
      lessonId: true,
      lesson: {
        select: {
          name: true,
          teacher: {
            select: {
              id: true,
              name: true,
              surname: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {classItem.name} Absensi
          </h1>
          <p className="mt-2 text-gray-600 dark:text-white">
          Melihat dan mengelola catatan absensi untuk {classItem.name}
          </p>
        </div>
      </div>

      <AttendanceTable
        students={students}
        lessons={lessons}
        role={role}
        currentUserId={currentUserId || undefined}
        existingAttendances={attendances}
      />
    </div>
  );
} 