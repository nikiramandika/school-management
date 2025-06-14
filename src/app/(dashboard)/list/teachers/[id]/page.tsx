import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Teacher, Day } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiCollection, HiDocumentText, HiIdentification, HiAcademicCap } from "react-icons/hi";

type TeacherWithRelations = Teacher & {
  _count: {
    subjects: number;
    lessons: number;
    classes: number;
  };
  subjects: { id: number; name: string }[];
  classes: {
    id: number;
    name: string;
    grade: {
      level: number;
    };
  }[];
  lessons: {
    id: number;
    day: Day;
    startTime: Date;
    endTime: Date;
    subject: {
      name: string;
    };
    class: {
      name: string;
      grade: {
        level: number;
      };
    };
  }[];
};

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
      subjects: {
        select: {
          id: true,
          name: true,
        },
      },
      classes: {
        select: {
          id: true,
          name: true,
          grade: {
            select: {
              level: true,
            },
          },
        },
      },
      lessons: {
        take: 5,
        orderBy: {
          id: "desc",
        },
        include: {
          subject: {
            select: {
              name: true,
            },
          },
          class: {
            select: {
              name: true,
              grade: {
                select: {
                  level: true,
                },
              },
            },
          },
        },
      },
    },
  }) as TeacherWithRelations | null;

  if (!teacher) {
    return notFound();
  }
  
  // Determine if user can edit
  const canEdit = role === "admin";
  const isViewOnly = role === "kepala_sekolah";

  return (
    <div className="p-3 sm:p-4 md:p-6 soft-light bg-softlight dark:bg-softdark m-2 sm:m-4 mt-0 rounded-3xl shadow-md">
      <div className="flex gap-4 sm:gap-6 flex-col xl:flex-row">
        {/* LEFT SECTION */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6">
          {/* TOP SECTION */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* USER INFO CARD - Full Width */}
            <div className="bg-lamaSky dark:bg-card py-6 px-6 rounded-2xl flex flex-col gap-6 shadow-sm min-w-0">
              {/* Header Section with Avatar and Edit Button */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Avatar Container */}
                <div className="flex justify-center sm:justify-start flex-shrink-0">
                  <div className="relative">
                    <Image
                      src={teacher.img || "/Avatar.png"}
                      alt=""
                      width={120}
                      height={120}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white/20 shadow-md"
                    />
                    {/* Online Status Indicator (optional) */}
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </div>

                {/* Name and Edit Button Container */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold dark:text-white text-center sm:text-left break-words leading-tight">
                        {teacher.name} {teacher.surname}
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left mt-1">
                        Guru • {teacher.subjects.length > 0 ? teacher.subjects.map(s => s.name).join(", ") : "Mata Pelajaran"}
                      </p>
                    </div>

                    {/* Edit Button */}
                    {canEdit && (
                      <div className="flex justify-center sm:justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center justify-center">
                                <FormContainer
                                  table="teacher"
                                  type="update"
                                  data={teacher}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="dark:bg-card dark:text-white">
                              Ubah Data Guru
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Teacher Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Blood Type */}
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-transparent rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Image
                      src="/blood.png"
                      alt="Blood Type"
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                      Golongan Darah
                    </p>
                    <p className="text-sm font-semibold dark:text-white truncate">
                      {teacher.bloodType}
                    </p>
                  </div>
                </div>

                {/* Birthday */}
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-transparent rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Image
                      src="/date.png"
                      alt="Birthday"
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                      Tanggal Lahir
                    </p>
                    <p className="text-sm font-semibold dark:text-white truncate">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(teacher.birthday)}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-transparent rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Image
                      src="/mail.png"
                      alt="Email"
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                      Email
                    </p>
                    <p className="text-sm font-semibold dark:text-white truncate">
                      {teacher.email || "Tidak tersedia"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-transparent rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Image
                      src="/phone.png"
                      alt="Phone"
                      width={16}
                      height={16}
                      className="opacity-80"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                      Telepon
                    </p>
                    <p className="text-sm font-semibold dark:text-white truncate">
                      {teacher.phone || "Tidak tersedia"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATISTICS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
              {/* ATTENDANCE CARD */}
              <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-sm min-w-0 items-center sm:items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                  <HiIdentification className="h-8 w-8 text-cyan-600 dark:text-cyan-400"></HiIdentification>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold dark:text-white">
                    90%
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Kehadiran
                  </p>
                </div>
              </div>

              {/* SUBJECTS CARD */}
              <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-sm min-w-0 items-center sm:items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                  <HiAcademicCap className="h-8 w-8 text-cyan-600 dark:text-cyan-400"></HiAcademicCap>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold dark:text-white">
                    {teacher._count.subjects}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Mata Pelajaran
                  </p>
                </div>
              </div>

              {/* LESSONS CARD */}
              <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-sm min-w-0 items-center sm:items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                  <HiDocumentText className="h-8 w-8 text-cyan-600 dark:text-cyan-400"></HiDocumentText>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold dark:text-white">
                    {teacher._count.lessons}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Pelajaran
                  </p>
                </div>
              </div>

              {/* CLASSES CARD */}
              <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 shadow-sm min-w-0 items-center sm:items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                  <HiCollection className="h-8 w-8 text-cyan-600 dark:text-cyan-400"></HiCollection>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold dark:text-white">
                    {teacher._count.classes}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Kelas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SCHEDULE SECTION */}
          <div className="bg-white dark:bg-card rounded-2xl p-4 sm:p-6 shadow-sm">
            <h1 className="text-lg sm:text-xl font-semibold dark:text-white mb-4">
              Jadwal Guru
            </h1>
            <div className="h-fit">
              <BigCalendarContainer type="teacherId" id={teacher.id} />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full xl:w-80 2xl:w-96 flex flex-col gap-4 sm:gap-6">
          {/* SHORTCUTS */}
          <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-2xl shadow-sm">
            <h1 className="text-lg sm:text-xl font-semibold dark:text-white mb-4">
              Pintasan
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 text-sm">
              <Link
                className="group p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-100 hover:to-blue-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 text-center xl:text-left shadow-sm hover:shadow-md"
                href={`/list/classes?supervisorId=${teacher.id}`}
              >
                <div className="flex items-center gap-3 xl:gap-4">
                  <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-300 text-sm font-semibold">
                      🏫
                    </span>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-200">
                    Kelas Guru
                  </span>
                </div>
              </Link>

              <Link
                className="group p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 hover:from-purple-100 hover:to-purple-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 text-center xl:text-left shadow-sm hover:shadow-md"
                href={`/list/students?teacherId=${teacher.id}`}
              >
                <div className="flex items-center gap-3 xl:gap-4">
                  <div className="w-8 h-8 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-300 text-sm font-semibold">
                      👨‍🎓
                    </span>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-200">
                    Siswa Guru
                  </span>
                </div>
              </Link>

              <Link
                className="group p-4 rounded-xl bg-gradient-to-r from-pink-50 to-pink-100 dark:from-gray-700 dark:to-gray-600 hover:from-pink-100 hover:to-pink-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 text-center xl:text-left shadow-sm hover:shadow-md"
                href={`/list/lessons?teacherId=${teacher.id}`}
              >
                <div className="flex items-center gap-3 xl:gap-4">
                  <div className="w-8 h-8 bg-pink-200 dark:bg-pink-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-600 dark:text-pink-300 text-sm font-semibold">
                      📚
                    </span>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-200">
                    Pelajaran Guru
                  </span>
                </div>
              </Link>

              <Link
                className="group p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 hover:from-green-100 hover:to-green-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 text-center xl:text-left shadow-sm hover:shadow-md"
                href={`/list/exams?teacherId=${teacher.id}`}
              >
                <div className="flex items-center gap-3 xl:gap-4">
                  <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-300 text-sm font-semibold">
                      📝
                    </span>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-200">
                    Ujian Guru
                  </span>
                </div>
              </Link>

              <Link
                className="group p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-700 dark:to-gray-600 hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 text-center xl:text-left shadow-sm hover:shadow-md"
                href={`/list/assignments?teacherId=${teacher.id}`}
              >
                <div className="flex items-center gap-3 xl:gap-4">
                  <div className="w-8 h-8 bg-yellow-200 dark:bg-yellow-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 dark:text-yellow-300 text-sm font-semibold">
                      📋
                    </span>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-white group-hover:text-yellow-700 dark:group-hover:text-yellow-200">
                    Tugas Guru
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* PERFORMANCE */}
          <div className="hidden sm:block rounded-2xl shadow-md">
            <Performance />
          </div>

          {/* ANNOUNCEMENTS */}
          <div className="hidden sm:block">
            <Announcements />
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM SECTION - Performance & Announcements */}
      <div className="flex flex-col gap-4 mt-6 sm:hidden">
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;