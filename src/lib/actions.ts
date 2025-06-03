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
    const clerk = await clerkClient();

    // Validate required fields for Clerk
    if (!data.username || !data.password || !data.name || !data.surname) {
      return {
        success: false,
        error: true,
        message: "Missing required fields for authentication",
      };
    }

    // Tambahkan prefix 'g-' pada username untuk Clerk
    const nip = data.username;
    const username = `g-${nip}`;

    // Check if username already exists
    try {
      const existingUser = await clerk.users.getUserList({
        username: [username],
      });
      if (existingUser.data.length > 0) {
        return {
          success: false,
          error: true,
          message: "NIP sudah terdaftar!",
        };
      }
    } catch (error) {
      // Continue if no user found
    }

    // Create Clerk user
    const user = await clerk.users.createUser({
      username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : undefined,
      publicMetadata: { role: "teacher", nip },
    });

    try {
      // Create teacher in database
      await prisma.teacher.create({
        data: {
          id: user.id,
          username: nip, // Simpan NIP asli di database
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

      revalidatePath("/list/teachers");
      return { success: true, error: false, message: "Teacher created successfully" };
    } catch (dbError) {
      // Rollback: Delete Clerk user if database creation fails
      try {
        await clerk.users.deleteUser(user.id);
      } catch (deleteError) {
        console.error("Failed to delete Clerk user after database error:", deleteError);
      }
      throw dbError;
    }
  } catch (err) {
    let message = "Gagal membuat guru. Silakan coba lagi.";
    if (err && typeof err === 'object' && 'errors' in err) {
      // Clerk error format
      const errorsArr = (err as any).errors;
      message = errorsArr?.[0]?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    console.error("Error creating teacher:", JSON.stringify(err, null, 2));
    return { success: false, error: true, message };
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

    // Tambahkan prefix 'g-' pada username untuk Clerk
    const nip = data.username;
    const username = `g-${nip}`;

    // Check if username already exists (excluding current user)
    try {
      const existingUser = await clerk.users.getUserList({
        username: [username],
      });
      if (existingUser.data.length > 0 && existingUser.data[0].id !== data.id) {
        return {
          success: false,
          error: true,
          message: "NIP sudah terdaftar!",
        };
      }
    } catch (error) {
      // Continue if no user found
    }

    const user = await clerk.users.updateUser(data.id, {
      username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    console.log("Clerk user updated:", user);

    // Log the subjects data
    console.log("Subjects data:", data.subjects);

    const updatedTeacher = await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: nip, // Simpan NIP asli di database
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
          })) || [],
        },
      },
      include: {
        subjects: true,
      },
    });

    console.log("Updated teacher:", updatedTeacher);

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
    const clerk = await clerkClient();

    // Validate required fields for Clerk
    if (!data.username || !data.password || !data.name || !data.surname) {
      return {
        success: false,
        error: true,
        message: "Missing required fields for authentication",
      };
    }

    // Tambahkan prefix 's-' pada username untuk Clerk
    const nisn = data.username;
    const username = `s-${nisn}`;

    // Check if username already exists
    try {
      const existingUser = await clerk.users.getUserList({
        username: [username],
      });
      if (existingUser.data.length > 0) {
        return {
          success: false,
          error: true,
          message: "NISN sudah terdaftar!",
        };
      }
    } catch (error) {
      // Continue if no user found
    }

    // Check class capacity
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { 
        success: false, 
        error: true, 
        message: "Kelas sudah penuh!" 
      };
    }

    // Create Clerk user
    const user = await clerk.users.createUser({
      username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : undefined,
      publicMetadata: { role: "student", nisn },
    });

    try {
      // Create student in database
      await prisma.student.create({
        data: {
          id: user.id,
          username: nisn, // Simpan NISN asli di database
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
    } catch (dbError) {
      // Rollback: Delete Clerk user if database creation fails
      try {
        await clerk.users.deleteUser(user.id);
      } catch (deleteError) {
        console.error("Failed to delete Clerk user after database error:", deleteError);
      }
      throw dbError;
    }
  } catch (err) {
    let message = "Gagal membuat siswa. Silakan coba lagi.";
    if (err && typeof err === 'object' && 'errors' in err) {
      const errorsArr = (err as any).errors;
      message = errorsArr?.[0]?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    console.error("Error creating student:", JSON.stringify(err, null, 2));
    return { success: false, error: true, message };
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
    console.log("Updating student with data:", data);
    const clerk = await clerkClient();

    // Tambahkan prefix 's-' pada username untuk Clerk
    const nisn = data.username;
    const username = `s-${nisn}`;

    // Check if username already exists (excluding current user)
    try {
      const existingUser = await clerk.users.getUserList({
        username: [username],
      });
      if (existingUser.data.length > 0 && existingUser.data[0].id !== data.id) {
        return {
          success: false,
          error: true,
          message: "NISN sudah terdaftar!",
        };
      }
    } catch (error) {
      // Continue if no user found
    }

    // Update Clerk user
    const user = await clerk.users.updateUser(data.id, {
      username,
      firstName: data.name,
      lastName: data.surname,
    });

    console.log("Clerk user updated:", user);

    // Update database
    const updatedStudent = await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: nisn, // Simpan NISN asli di database
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

    console.log("Updated student:", updatedStudent);

    revalidatePath("/list/students");
    return { success: true, error: false, message: "Student updated successfully" };
  } catch (err) {
    console.error("Error updating student:", err);
    let message = "Gagal memperbarui data siswa. Silakan coba lagi.";
    if (err && typeof err === 'object' && 'errors' in err) {
      const errorsArr = (err as any).errors;
      message = errorsArr?.[0]?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    return { success: false, error: true, message };
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

export async function createResult(
  prevState: { success: boolean; error: boolean; message: string },
  formData: {
    studentId: string;
    examId?: number;
    assignmentId?: number;
    score: number;
  }
) {
  "use server";
  
  try {
    console.log('Creating result with data:', formData);

    // Validate required fields
    if (!formData.studentId || (!formData.examId && !formData.assignmentId) || formData.score === undefined) {
      console.log('Missing required fields:', formData);
      return { 
        success: false, 
        error: true, 
        message: "Missing required fields" 
      };
    }

    // Validate score range and convert to integer
    const score = Math.round(formData.score);
    if (score < 0 || score > 100) {
      console.log('Invalid score:', score);
      return { 
        success: false, 
        error: true, 
        message: "Score must be between 0 and 100" 
      };
    }

    // Check if result already exists
    const existingResult = await prisma.result.findFirst({
      where: {
        studentId: formData.studentId,
        ...(formData.examId ? { examId: formData.examId } : { assignmentId: formData.assignmentId })
      }
    });

    if (existingResult) {
      console.log('Result already exists:', existingResult);
      return {
        success: false,
        error: true,
        message: "Grade already exists for this student and assessment"
      };
    }

    const result = await prisma.result.create({
      data: {
        studentId: formData.studentId,
        score: score,
        examId: formData.examId,
        assignmentId: formData.assignmentId,
      },
    });

    console.log('Created result:', result);

    // Revalidate the current page
    const path = formData.examId ? `/list/results/${formData.examId}/exam` : `/list/results/${formData.assignmentId}/assignment`;
    revalidatePath(path);
    
    return { 
      success: true, 
      error: false, 
      message: "Grade saved successfully" 
    };
  } catch (err) {
    console.error("Error saving grade:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to save grade" 
    };
  }
}

export async function updateResult(
  prevState: { success: boolean; error: boolean; message: string },
  formData: {
    id: number;
    studentId: string;
    examId?: number;
    assignmentId?: number;
    score: number;
  }
) {
  "use server";
  
  try {
    console.log('Updating result with data:', formData);

    // Validate required fields
    if (!formData.id || !formData.studentId || (!formData.examId && !formData.assignmentId) || formData.score === undefined) {
      console.log('Missing required fields:', formData);
      return { 
        success: false, 
        error: true, 
        message: "Missing required fields" 
      };
    }

    // Validate score range and convert to integer
    const score = Math.round(formData.score);
    if (score < 0 || score > 100) {
      console.log('Invalid score:', score);
      return { 
        success: false, 
        error: true, 
        message: "Score must be between 0 and 100" 
      };
    }

    const result = await prisma.result.update({
      where: {
        id: formData.id,
      },
      data: {
        score: score,
      },
    });

    console.log('Updated result:', result);

    // Revalidate the current page
    const path = formData.examId ? `/list/results/${formData.examId}/exam` : `/list/results/${formData.assignmentId}/assignment`;
    revalidatePath(path);
    
    return { 
      success: true, 
      error: false, 
      message: "Grade updated successfully" 
    };
  } catch (err) {
    console.error("Error updating grade:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to update grade" 
    };
  }
}

export async function deleteResult(
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false, message: "Result deleted successfully" };
  } catch (error) {
    console.error("Error deleting result:", error);
    return {
      success: false,
      error: true,
      message: error instanceof Error ? error.message : "Failed to delete result",
    };
  }
}

export const createAnnouncement = async (
  currentState: CurrentState,
  data: {
    title: string;
    description: string;
    date: string;
    classId?: number;
    id?: number;
  }
): Promise<CurrentState> => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Announcement created successfully" };
  } catch (err) {
    console.error("Error creating announcement:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to create announcement" 
    };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: {
    id: number;
    title: string;
    description: string;
    date: string;
    classId?: number;
  }
): Promise<CurrentState> => {
  try {
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Announcement updated successfully" };
  } catch (err) {
    console.error("Error updating announcement:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to update announcement" 
    };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Announcement deleted successfully" };
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Failed to delete announcement" 
    };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: {
    studentId: string;
    lessonId: number;
    date: Date;
    present: boolean;
  }
): Promise<CurrentState> => {
  try {
    const attendance = await prisma.attendance.create({
      data: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        date: data.date,
        present: data.present,
      },
    });

    return {
      success: true,
      error: false,
      message: "Attendance record created successfully",
    };
  } catch (error) {
    console.error("Error creating attendance:", error);
    return {
      success: false,
      error: true,
      message: "Failed to create attendance record",
    };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: {
    id: number;
    studentId: string;
    lessonId: number;
    date: Date;
    present: boolean;
  }
): Promise<CurrentState> => {
  try {
    const attendance = await prisma.attendance.update({
      where: {
        id: data.id,
      },
      data: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        date: data.date,
        present: data.present,
      },
    });

    return {
      success: true,
      error: false,
      message: "Attendance record updated successfully",
    };
  } catch (error) {
    console.error("Error updating attendance:", error);
    return {
      success: false,
      error: true,
      message: "Failed to update attendance record",
    };
  }
};
