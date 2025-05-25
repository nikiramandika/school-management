"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  LessonSchema,
  AssignmentSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = {
  success: boolean;
  error: boolean;
  message: string;
};

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
): Promise<CurrentState> => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
      include: {
        teachers: true,
        lessons: {
          include: {
            class: true,
            teacher: true,
          },
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "Subject created successfully" };
  } catch (err) {
    console.error("Error creating subject:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to create subject" 
    };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
): Promise<CurrentState> => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
      include: {
        teachers: true,
        lessons: {
          include: {
            class: true,
            teacher: true,
          },
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "Subject updated successfully" };
  } catch (err) {
    console.error("Error updating subject:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to update subject" 
    };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    // Check if subject has any lessons
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: { lessons: true },
    });

    if (subject?.lessons.length) {
      return {
        success: false,
        error: true,
        message:
          "Cannot delete subject because it has associated lessons. Please delete the lessons first.",
      };
    }

    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "Subject deleted successfully" };
  } catch (err) {
    console.error("Error deleting subject:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete subject" 
    };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
): Promise<CurrentState> => {
  try {
    await prisma.class.create({
      data,
    });

    revalidatePath("/list/class");
    return { success: true, error: false, message: "Class created successfully" };
  } catch (err) {
    console.error("Error creating class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to create class" 
    };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
): Promise<CurrentState> => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    revalidatePath("/list/class");
    return { success: true, error: false, message: "Class updated successfully" };
  } catch (err) {
    console.error("Error updating class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to update class" 
    };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/class");
    return { success: true, error: false, message: "Class deleted successfully" };
  } catch (err) {
    console.error("Error deleting class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete class" 
    };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
): Promise<CurrentState> => {
  try {
    console.log("Creating teacher with data:", data);
    const clerk = await clerkClient();
    try {
      // Validate required fields for Clerk
      if (!data.username || !data.password || !data.name || !data.surname) {
        console.error("Missing required fields for Clerk:", {
          username: !!data.username,
          password: !!data.password,
          name: !!data.name,
          surname: !!data.surname,
        });
        return {
          success: false,
          error: true,
          message: "Missing required fields for authentication",
        };
      }

      // Validate password requirements
      if (data.password.length < 8) {
        return {
          success: false,
          error: true,
          message: "Password must be at least 8 characters long",
        };
      }

      // Additional password validation
      const hasUpperCase = /[A-Z]/.test(data.password);
      const hasLowerCase = /[a-z]/.test(data.password);
      const hasNumbers = /\d/.test(data.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return {
          success: false,
          error: true,
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        };
      }

      // Check if username already exists
      try {
        const existingUser = await clerk.users.getUserList({
          username: [data.username],
        });
        if (existingUser.data.length > 0) {
          return {
            success: false,
            error: true,
            message: "Username already exists",
          };
        }
      } catch (error) {
        console.error("Error checking existing username:", error);
      }

      console.log("Attempting to create Clerk user with:", {
        username: data.username,
        firstName: data.name,
        lastName: data.surname,
        hasPassword: !!data.password,
        hasEmail: !!data.email,
      });

      const user = await clerk.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,
        lastName: data.surname,
        emailAddress: data.email ? [data.email] : undefined,
        publicMetadata: { role: "teacher" },
      });
      console.log("Clerk user created:", user);

      try {
        await prisma.teacher.create({
          data: {
            id: user.id,
            username: data.username,
            name: data.name,
            surname: data.surname,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address,
            img: data.img || null,
            bloodType: data.bloodType,
            sex: data.sex,
            birthday: data.birthday,
            subjects: {
              connect: data.subjects?.map((subjectId: string) => ({
                id: parseInt(subjectId),
              })),
            },
          },
        });
        console.log("Teacher created in database");
        revalidatePath("/list/teachers");
        return {
          success: true,
          error: false,
          message: "Teacher created successfully",
        };
      } catch (dbError) {
        console.error("Error creating teacher in database:", dbError);
        // Try to delete the Clerk user if database creation fails
        try {
          await clerk.users.deleteUser(user.id);
          console.log("Clerk user deleted after database error");
        } catch (deleteError) {
          console.error(
            "Error deleting Clerk user after database error:",
            deleteError
          );
        }
        return {
          success: false,
          error: true,
          message: "Failed to create teacher in database",
        };
      }
    } catch (clerkError: any) {
      console.error("Error creating Clerk user:", {
        error: clerkError,
        message: clerkError.message,
        code: clerkError.code,
        errors: clerkError.errors,
      });

      // Handle specific Clerk errors
      if (clerkError.errors?.[0]?.message) {
        const errorMessage = clerkError.errors[0].message;
        if (errorMessage.includes("data breach")) {
          return {
            success: false,
            error: true,
            message:
              "This password has been found in a data breach. Please use a stronger, unique password that hasn't been compromised.",
          };
        }
        return {
          success: false,
          error: true,
          message: errorMessage,
        };
      }

      return {
        success: false,
        error: true,
        message: `Failed to create user in authentication system: ${
          clerkError.message || "Unknown error"
        }`,
      };
    }
  } catch (err) {
    console.error("Unexpected error in createTeacher:", err);
    return {
      success: false,
      error: true,
      message: "An unexpected error occurred",
    };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return { 
      success: false, 
      error: true, 
      message: "Teacher ID is required for update" 
    };
  }
  try {
    console.log("Updating teacher with data:", data);
    const clerk = await clerkClient();
    const user = await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    console.log("Clerk user updated:", user);

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false, message: "Teacher updated successfully" };
  } catch (err) {
    console.error("Error updating teacher:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to update teacher" 
    };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false, message: "Teacher deleted successfully" };
  } catch (err) {
    console.error("Error deleting teacher:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete teacher" 
    };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
): Promise<CurrentState> => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { 
        success: false, 
        error: true, 
        message: "Class has reached maximum capacity" 
      };
    }

    const clerk = await clerkClient();
    const user = await clerk.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
      },
    });

    revalidatePath("/list/students");
    return { success: true, error: false, message: "Student created successfully" };
  } catch (err) {
    console.error("Error creating student:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to create student" 
    };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
): Promise<CurrentState> => {
  if (!data.id) {
    return { 
      success: false, 
      error: true, 
      message: "Student ID is required for update" 
    };
  }
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
      },
    });
    revalidatePath("/list/students");
    return { success: true, error: false, message: "Student updated successfully" };
  } catch (err) {
    console.error("Error updating student:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to update student" 
    };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/students");
    return { success: true, error: false, message: "Student deleted successfully" };
  } catch (err) {
    console.error("Error deleting student:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete student" 
    };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
): Promise<CurrentState> => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "Exam created successfully" };
  } catch (err) {
    console.error("Error creating exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to create exam" 
    };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
): Promise<CurrentState> => {
  try {
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "Exam updated successfully" };
  } catch (err) {
    console.error("Error updating exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to update exam" 
    };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "Exam deleted successfully" };
  } catch (err) {
    console.error("Error deleting exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete exam" 
    };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    classId?: number;
    id?: number;
  }
): Promise<CurrentState> => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false, message: "Event created successfully" };
  } catch (err) {
    console.error("Error creating event:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to create event" 
    };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: {
    id?: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    classId?: number;
  }
): Promise<CurrentState> => {
  try {
    if (!data.id) {
      return { 
        success: false, 
        error: true, 
        message: "Event ID is required for update" 
      };
    }

    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false, message: "Event updated successfully" };
  } catch (err) {
    console.error("Error updating event:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to update event" 
    };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false, message: "Event deleted successfully" };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete event" 
    };
  }
};

export async function createLesson(
  currentState: CurrentState,
  data: LessonSchema
): Promise<CurrentState> {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(`1970-01-01T${data.startTime}`),
        endTime: new Date(`1970-01-01T${data.endTime}`),
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });

    revalidatePath("/list/lessons");
    return {
      success: true,
      error: false,
      message: "Lesson created successfully",
    };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return {
      success: false,
      error: true,
      message:
        error instanceof Error ? error.message : "Failed to create lesson",
    };
  }
}

export async function updateLesson(
  currentState: CurrentState,
  data: LessonSchema
): Promise<CurrentState> {
  try {
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(`1970-01-01T${data.startTime}`),
        endTime: new Date(`1970-01-01T${data.endTime}`),
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });

    revalidatePath("/list/lessons");
    return {
      success: true,
      error: false,
      message: "Lesson updated successfully",
    };
  } catch (error) {
    console.error("Error updating lesson:", error);
    return {
      success: false,
      error: true,
      message:
        error instanceof Error ? error.message : "Failed to update lesson",
    };
  }
}

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    // Check if lesson has any related records
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
      include: {
        exams: true,
        assignments: true,
        attendances: true,
      },
    });

    if (lesson?.exams.length || lesson?.assignments.length || lesson?.attendances.length) {
      return {
        success: false,
        error: true,
        message: "Cannot delete lesson because it has associated records",
      };
    }

    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false, message: "Lesson deleted successfully" };
  } catch (err) {
    console.error("Error deleting lesson:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete lesson" 
    };
  }
};

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
): Promise<CurrentState> => {
  try {
    console.log("Creating assignment with data:", data);
    const result = await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startTime,
        dueDate: data.endTime,
        lessonId: data.lessonId,
      },
    });
    console.log("Assignment created successfully:", result);

    revalidatePath("/list/assignments");
    return { 
      success: true, 
      error: false,
      message: "Assignment created successfully" 
    };
  } catch (err) {
    console.error("Error creating assignment:", err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : "Failed to create assignment"
    };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
): Promise<CurrentState> => {
  try {
    console.log("Updating assignment with data:", data);
    const result = await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startTime,
        dueDate: data.endTime,
        lessonId: data.lessonId,
      },
    });
    console.log("Assignment updated successfully:", result);

    revalidatePath("/list/assignments");
    return { 
      success: true, 
      error: false,
      message: "Assignment updated successfully" 
    };
  } catch (err) {
    console.error("Error updating assignment:", err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : "Failed to update assignment"
    };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/assignments");
    return { 
      success: true, 
      error: false,
      message: "Assignment deleted successfully" 
    };
  } catch (err) {
    console.error("Error deleting assignment:", err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : "Failed to delete assignment"
    };
  }
};
