import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Nama mata pelajaran wajib diisi!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Nama kelas wajib diisi!" }),
  capacity: z.coerce.number().min(1, { message: "Kapasitas kelas wajib diisi!" }),
  gradeId: z.coerce.number().min(1, { message: "Tingkat kelas wajib diisi!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(1, { message: "NIP wajib diisi!" })
    .regex(/^\d+$/, { message: "NIP harus berupa angka!" })
    .length(18, { message: "NIP harus 18 digit!" }),
  password: z
    .string()
    .min(8, { message: "Password minimal 8 karakter!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Nama depan wajib diisi!" }),
  surname: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  email: z
    .string()
    .email({ message: "Format email tidak valid!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Golongan darah wajib diisi!" }),
  birthday: z.coerce.date({ message: "Tanggal lahir wajib diisi!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Jenis kelamin wajib diisi!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(1, { message: "NISN wajib diisi!" })
    .regex(/^\d+$/, { message: "NISN harus berupa angka!" })
    .length(10, { message: "NISN harus 10 digit!" }),
  password: z
    .string()
    .min(8, { message: "Password minimal 8 karakter!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Nama depan wajib diisi!" }),
  surname: z.string().min(1, { message: "Nama belakang wajib diisi!" }),
  email: z
    .string()
    .email({ message: "Format email tidak valid!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, { message: "Alamat wajib diisi!" }),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Golongan darah wajib diisi!" }),
  birthday: z.coerce.date({ message: "Tanggal lahir wajib diisi!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Jenis kelamin wajib diisi!" }),
  gradeId: z.coerce.number().optional(),
  classId: z.coerce.number().min(1, { message: "Kelas wajib diisi!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const lessonSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    required_error: "Day is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  subjectId: z.number().min(1, "Subject is required"),
  classId: z.number().min(1, "Class is required"),
  teacherId: z.string().min(1, "Teacher is required"),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.number().optional(),
  studentId: z.string().min(1, "Student is required"),
  examId: z.number().optional(),
  assignmentId: z.number().optional(),
  score: z.coerce.number().min(0).max(100, "Score must be between 0 and 100"),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" })
    .refine((date) => {
      const startTime = (date as any).parent?.startTime;
      if (!startTime) return true;
      return date > startTime;
    }, { message: "End time must be after start time!" }),
  classId: z.coerce.number().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  classId: z.coerce.number().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const attendanceSchema = z.object({
  id: z.number().optional(),
  studentId: z.string().min(1, "Student is required"),
  lessonId: z.number().min(1, "Lesson is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["PRESENT", "SICK", "PERMITTED", "ABSENT"]),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;
