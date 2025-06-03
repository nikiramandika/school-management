import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!lessonId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        lessonId: parseInt(lessonId),
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendances" },
      { status: 500 }
    );
  }
}
