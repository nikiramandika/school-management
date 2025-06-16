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
  academicYear: z.string().min(4, { message: "Tahun ajaran wajib diisi!" }),
  semester: z.enum(["GANJIL", "GENAP"], { message: "Semester wajib diisi!" }),
  isActive: z.boolean().default(true),
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
  title: z.string().min(1, { message: "Judul ujian wajib diisi!" }),
  startTime: z.coerce.date({ message: "Waktu mulai wajib diisi!" }),
  endTime: z.coerce.date({ message: "Waktu selesai wajib diisi!" }),
  lessonId: z.coerce.number({ message: "Pelajaran wajib diisi!" }),
  semester: z.enum(["GANJIL", "GENAP"], { message: "Semester wajib diisi!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const lessonSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Nama pelajaran wajib diisi"),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    required_error: "Hari wajib diisi",
  }),
  startTime: z.string().min(1, "Waktu mulai wajib diisi"),
  endTime: z.string().min(1, "Waktu selesai wajib diisi"),
  subjectId: z.number().min(1, "Mata pelajaran wajib diisi"),
  classId: z.number().min(1, "Kelas wajib diisi"),
  teacherId: z.string().min(1, "Guru wajib diisi"),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Judul harus diisi!" }),
  startTime: z.coerce.date({ message: "Waktu mulai harus diisi!" }),
  endTime: z.coerce.date({ message: "Waktu berakhir harus diisi!" }),
  lessonId: z.coerce.number({ message: "Pelajaran harus di isi"! }),
  semester: z.enum(["GANJIL", "GENAP"], { message: "Semester wajib diisi!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.number().optional(),
  studentId: z.string().min(1, "Siswa wajib diisi"),
  examId: z.number().optional(),
  assignmentId: z.number().optional(),
  score: z.coerce.number().min(0).max(100, "Nilai harus antara 0 dan 100"),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Judul harus diisi!" }),
  description: z.string().min(1, { message: "Deskripsi harus diisi!" }),
  startTime: z.coerce.date({ message: "Waktu mulai harus diisi!" }),
  endTime: z.coerce.date({ message: "Waktu berakhir harus diisi!" })
    .refine((date) => {
      const startTime = (date as any).parent?.startTime;
      if (!startTime) return true;
      return date > startTime;
    }, { message: "Waktu berakhir harus setelah waktu mulai" }),
  classId: z.coerce.number().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Judul harus diisi!" }),
  description: z.string().min(1, { message: "Deskripsi harus diisi!" }),
  date: z.coerce.date({ message: "Tanggal harus diisi!" }),
  classId: z.coerce.number().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const attendanceSchema = z.object({
  id: z.number().optional(),
  studentId: z.string().min(1, "Siswa wajib diisi"),
  lessonId: z.number().min(1, "Pelajaran wajib diisi!"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  status: z.enum(["PRESENT", "SICK", "PERMITTED", "ABSENT"], {
    errorMap: () => ({ message: "Status kehadiran wajib diisi" }),
  }),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;
