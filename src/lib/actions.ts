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
    return { success: true, error: false, message: "Mata pelajaran berhasil dibuat" };
  } catch (err) {
    console.error("Error creating subject:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal membuat mata pelajaran" 
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
    return { success: true, error: false, message: "Mata pelajaran berhasil diperbarui" };
  } catch (err) {
    console.error("Error updating subject:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal memperbarui mata pelajaran" 
    };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    // Check if subject has any lessons
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: { 
        lessons: {
          include: {
            exams: true,
            assignments: true,
            attendances: true
          }
        }
      },
    });

    if (subject?.lessons.length && !confirmDelete) {
      return {
        success: false,
        error: true,
        message: "Tidak dapat menghapus mata pelajaran karena memiliki pelajaran terkait. Silakan konfirmasi penghapusan untuk menghapus semua data terkait.",
      };
    }

    // If confirmed, delete all related data
    if (confirmDelete && subject?.lessons.length) {
      // Delete all related data
      for (const lesson of subject.lessons) {
        // Delete exams
        await prisma.exam.deleteMany({
          where: { lessonId: lesson.id }
        });

        // Delete assignments
        await prisma.assignment.deleteMany({
          where: { lessonId: lesson.id }
        });

        // Delete attendances
        await prisma.attendance.deleteMany({
          where: { lessonId: lesson.id }
        });
      }

      // Delete lessons
      await prisma.lesson.deleteMany({
        where: { subjectId: parseInt(id) }
      });
    }

    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "Mata pelajaran dan semua data terkait berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting subject:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus mata pelajaran" 
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
    return { success: true, error: false, message: "Kelas berhasil dibuat" };
  } catch (err) {
    console.error("Error creating class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal membuat kelas" 
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
    return { success: true, error: false, message: "Kelas berhasil diperbarui" };
  } catch (err) {
    console.error("Error updating class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal memperbarui kelas" 
    };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    // Check if class has any related records
    const classData = await prisma.class.findUnique({
      where: { id: parseInt(id) },
      include: {
        students: {
          include: {
            results: true,
            attendances: true
          }
        },
        lessons: {
          include: {
            exams: true,
            assignments: true,
            attendances: true
          }
        },
        events: true,
        announcements: true
      },
    });

    if ((classData?.students.length || classData?.lessons.length || classData?.events.length || classData?.announcements.length) && !confirmDelete) {
      return {
        success: false,
        error: true,
        message: "Tidak dapat menghapus kelas karena memiliki data terkait. Silakan konfirmasi penghapusan untuk menghapus semua data terkait.",
      };
    }

    // If confirmed, delete all related data in the correct order
    if (confirmDelete) {
      // 1. First delete all results for students in this class
      for (const student of classData?.students || []) {
        await prisma.result.deleteMany({
          where: { studentId: student.id }
        });
      }

      // 2. Delete all attendances for students in this class
      for (const student of classData?.students || []) {
        await prisma.attendance.deleteMany({
          where: { studentId: student.id }
        });
      }

      // 3. Delete all exams and assignments for lessons in this class
      for (const lesson of classData?.lessons || []) {
        // Delete results for exams
        await prisma.result.deleteMany({
          where: { examId: { in: lesson.exams.map(exam => exam.id) } }
        });

        // Delete exams
        await prisma.exam.deleteMany({
          where: { lessonId: lesson.id }
        });

        // Delete results for assignments
        await prisma.result.deleteMany({
          where: { assignmentId: { in: lesson.assignments.map(assignment => assignment.id) } }
        });

        // Delete assignments
        await prisma.assignment.deleteMany({
          where: { lessonId: lesson.id }
        });

        // Delete attendances for this lesson
        await prisma.attendance.deleteMany({
          where: { lessonId: lesson.id }
        });
      }

      // 4. Delete all lessons
      await prisma.lesson.deleteMany({
        where: { classId: parseInt(id) }
      });

      // 5. Delete all events
      await prisma.event.deleteMany({
        where: { classId: parseInt(id) }
      });

      // 6. Delete all announcements
      await prisma.announcement.deleteMany({
        where: { classId: parseInt(id) }
      });

      // 7. Finally delete all students
      for (const student of classData?.students || []) {
        const clerk = await clerkClient();
        await clerk.users.deleteUser(student.id);
      }

      await prisma.student.deleteMany({
        where: { classId: parseInt(id) }
      });
    }

    // 8. Finally delete the class
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/class");
    return { success: true, error: false, message: "Kelas dan semua data terkait berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus kelas" 
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
      return { success: true, error: false, message: "Guru berhasil dibuat" };
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
    return { success: true, error: false, message: "Guru berhasil diperbarui" };
  } catch (err) {
    console.error("Error updating teacher:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal memperbarui guru" 
    };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    // Check if teacher has any related records
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            lessons: {
              include: {
                exams: true,
                assignments: true,
                attendances: true
              }
            }
          }
        }
      },
    });

    if (teacher?.subjects.length && !confirmDelete) {
      return {
        success: false,
        error: true,
        message: "Tidak dapat menghapus guru karena memiliki mata pelajaran terkait. Silakan konfirmasi penghapusan untuk menghapus semua data terkait.",
      };
    }

    // If confirmed, delete all related data
    if (confirmDelete) {
      // Delete all related data
      for (const subject of teacher?.subjects || []) {
        for (const lesson of subject.lessons) {
          // Delete exams
          await prisma.exam.deleteMany({
            where: { lessonId: lesson.id }
          });

          // Delete assignments
          await prisma.assignment.deleteMany({
            where: { lessonId: lesson.id }
          });

          // Delete attendances
          await prisma.attendance.deleteMany({
            where: { lessonId: lesson.id }
          });
        }

        // Delete lessons
        await prisma.lesson.deleteMany({
          where: { subjectId: subject.id }
        });
      }

      // Remove teacher from subjects
      await prisma.teacher.update({
        where: { id },
        data: {
          subjects: {
            set: []
          }
        }
      });
    }

    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false, message: "Guru dan semua data terkait berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting teacher:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus guru" 
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
      return { success: true, error: false, message: "Siswa berhasil dibuat" };
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
    return { success: true, error: false, message: "Siswa berhasil diperbarui" };
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
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    // Check if student has any related records
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        attendances: true,
        results: true
      },
    });

    if ((student?.attendances.length || student?.results.length) && !confirmDelete) {
      return {
        success: false,
        error: true,
        message: "Tidak dapat menghapus siswa karena memiliki catatan kehadiran dan hasil terkait. Silakan konfirmasi penghapusan untuk menghapus semua data terkait.",
      };
    }

    // If confirmed, delete all related data
    if (confirmDelete) {
      // Delete attendances
      await prisma.attendance.deleteMany({
        where: { studentId: id }
      });

      // Delete results
      await prisma.result.deleteMany({
        where: { studentId: id }
      });
    }

    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/students");
    return { success: true, error: false, message: "Siswa dan semua data terkait berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting student:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus siswa" 
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
    return { success: true, error: false, message: "Ujian berhasil dibuat" };
  } catch (err) {
    console.error("Error creating exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal membuat ujian" 
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
    return { success: true, error: false, message: "Ujian berhasil diperbarui" };
  } catch (err) {
    console.error("Error updating exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal memperbarui ujian" 
    };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    // Check if exam has any related records
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(id) },
      include: {
        results: true
      },
    });

    if (exam?.results.length && !confirmDelete) {
      return {
        success: false,
        error: true,
        message: "Tidak dapat menghapus ujian karena memiliki hasil terkait. Silakan konfirmasi penghapusan untuk menghapus semua data terkait.",
      };
    }

    // If confirmed, delete all related data
    if (confirmDelete) {
      // Delete results
      await prisma.result.deleteMany({
        where: { examId: parseInt(id) }
      });
    }

    await prisma.exam.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "Ujian dan semua data terkait berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus ujian" 
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
    return { success: true, error: false, message: "Acara berhasil dibuat" };
  } catch (err) {
    console.error("Error creating event:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal membuat acara" 
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
        message: "ID Acara diperlukan untuk pembaruan" 
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
    return { success: true, error: false, message: "Acara berhasil diperbarui" };
  } catch (err) {
    console.error("Error updating event:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal memperbarui acara" 
    };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false, message: "Acara berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus acara" 
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
      message: "Pelajaran berhasil dibuat",
    };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return {
      success: false,
      error: true,
      message:
        error instanceof Error ? error.message : "Gagal membuat pelajaran",
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
      message: "Pelajaran berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating lesson:", error);
    return {
      success: false,
      error: true,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui pelajaran",
    };
  }
}

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
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

    if ((lesson?.exams.length || lesson?.assignments.length || lesson?.attendances.length) && !confirmDelete) {
      return {
        success: false,
        error: true,
        message: "Tidak dapat menghapus pelajaran karena memiliki data terkait. Silakan konfirmasi penghapusan untuk menghapus semua data terkait.",
      };
    }

    // If confirmed, delete all related data
    if (confirmDelete) {
      // Delete exams
      await prisma.exam.deleteMany({
        where: { lessonId: parseInt(id) }
      });

      // Delete assignments
      await prisma.assignment.deleteMany({
        where: { lessonId: parseInt(id) }
      });

      // Delete attendances
      await prisma.attendance.deleteMany({
        where: { lessonId: parseInt(id) }
      });
    }

    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false, message: "Pelajaran dan semua data terkait berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting lesson:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus pelajaran" 
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
      message: "Tugas berhasil dibuat" 
    };
  } catch (err) {
    console.error("Error creating assignment:", err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : "Gagal membuat tugas"
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
      message: "Tugas berhasil diperbarui" 
    };
  } catch (err) {
    console.error("Error updating assignment:", err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : "Gagal memperbarui tugas"
    };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    // Check if assignment has any related records
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) },
      include: {
        results: true
      },
    });

    if (assignment?.results.length && !confirmDelete) {
      return {
        success: false,
        error: true,
        message: "Tidak dapat menghapus tugas karena memiliki hasil terkait. Silakan konfirmasi penghapusan untuk menghapus semua data terkait.",
      };
    }

    // If confirmed, delete all related data
    if (confirmDelete) {
      // Delete results
      await prisma.result.deleteMany({
        where: { assignmentId: parseInt(id) }
      });
    }

    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false, message: "Tugas dan semua data terkait berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting assignment:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus tugas" 
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
      message: err instanceof Error ? err.message : "Gagal menyimpan grade" 
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
      message: err instanceof Error ? err.message : "Gagal memperbarui grade" 
    };
  }
}

export async function deleteResult(
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false, message: "Result deleted successfully" };
  } catch (err) {
    console.error("Error deleting result:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus result" 
    };
  }
};

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
    return { success: true, error: false, message: "Pengumuman berhasil dibuat" };
  } catch (err) {
    console.error("Error creating announcement:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal membuat pengumuman" 
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
    return { success: true, error: false, message: "Pengumuman berhasil diperbarui" };
  } catch (err) {
    console.error("Error updating announcement:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal memperbarui pengumuman" 
    };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  const confirmDelete = data.get("confirmDelete") === "true";
  
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Pengumuman berhasil dihapus" };
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Gagal menghapus pengumuman" 
    };
  }
};

export const createAttendance = async (
  currentState: CurrentState,
  data: {
    studentId: string;
    lessonId: number;
    date: Date;
    status: "PRESENT" | "SICK" | "PERMITTED" | "ABSENT";
  }
): Promise<CurrentState> => {
  try {
    const attendance = await prisma.attendance.create({
      data: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        date: data.date,
        status: data.status,
      },
    });

    return {
      success: true,
      error: false,
      message: "Record kehadiran berhasil dibuat",
    };
  } catch (error) {
    console.error("Error creating attendance:", error);
    return {
      success: false,
      error: true,
      message: "Gagal membuat record kehadiran",
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
    status: "PRESENT" | "SICK" | "PERMITTED" | "ABSENT";
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
        status: data.status,
      },
    });

    return {
      success: true,
      error: false,
      message: "Record kehadiran berhasil diperbarui",
    };
  } catch (error) {
    console.error("Error updating attendance:", error);
    return {
      success: false,
      error: true,
      message: "Gagal memperbarui record kehadiran",
    };
  }
};
