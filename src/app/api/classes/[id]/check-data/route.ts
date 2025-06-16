import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = parseInt(params.id);
    
    if (isNaN(classId)) {
      return NextResponse.json(
        { error: "Invalid class ID" },
        { status: 400 }
      );
    }

    // Check if class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        lessons: {
          include: {
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
          }
        }
      }
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Count exams and assignments with results
    const examCount = classData.lessons.reduce((sum, lesson) => 
      sum + lesson.exams.filter(exam => exam.results.length > 0).length, 0
    );
    
    const assignmentCount = classData.lessons.reduce((sum, lesson) => 
      sum + lesson.assignments.filter(assignment => assignment.results.length > 0).length, 0
    );

    const hasData = examCount > 0 || assignmentCount > 0;

    return NextResponse.json({
      hasData,
      examCount,
      assignmentCount,
      semester: classData.semester,
      className: classData.name
    });

  } catch (error) {
    console.error("Error checking class data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 