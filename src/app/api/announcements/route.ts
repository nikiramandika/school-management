import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    const roleConditions = {
      teacher: { lessons: { some: { teacherId: userId! } } },
      student: { students: { some: { id: userId! } } },
    };

    const data = await prisma.announcement.findMany({
      take: 3,
      orderBy: { date: "desc" },
      where: {
        ...(role !== "admin" && {
          OR: [
            { classId: null },
            { class: roleConditions[role as keyof typeof roleConditions] || {} },
          ],
        }),
      },
      include: {
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Error fetching announcements" }, { status: 500 });
  }
}