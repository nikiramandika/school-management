import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's role from session claims
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    let lessons;

    if (role === "teacher") {
      // If user is a teacher, get their lessons
      lessons = await prisma.lesson.findMany({
        where: {
          teacherId: userId,
        },
        include: {
          class: true,
        },
      });
    } else if (role === "student") {
      // If user is a student, get lessons from their class
      const student = await prisma.student.findUnique({
        where: { id: userId },
        include: { class: true },
      });

      if (student?.class) {
        lessons = await prisma.lesson.findMany({
          where: {
            classId: student.class.id,
          },
          include: {
            teacher: true,
          },
        });
      }
    } else {
      // If user is admin, get all lessons
      lessons = await prisma.lesson.findMany({
        include: {
          class: true,
          teacher: true,
        },
      });
    }

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("[LESSONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 