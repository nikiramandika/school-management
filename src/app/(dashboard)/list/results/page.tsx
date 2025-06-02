import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import ClassList from "./class-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Users,
  GraduationCap,
  BarChart3,
  BookOpen,
  School,
  Trophy,
} from "lucide-react";

// Enhanced Header component with visual improvements
const PageHeader = ({
  role,
  totalClasses,
  totalStudents,
}: {
  role: string;
  totalClasses: number;
  totalStudents: number;
}) => (
  <div className="space-y-6">
    {/* Conditional Header Section - Only show management header for admin */}
    {role === "admin" && (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500  rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manajemen Nilai
              </h2>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Stats Cards - Only show for admin */}
    {role === "admin" && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r bg-cyan-500 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Total Kelas</p>
                <p className="text-3xl font-bold">{totalClasses}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <School className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r bg-cyan-500 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Total Siswa</p>
                <p className="text-3xl font-bold">{totalStudents}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r bg-cyan-500 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">
                  Rata-rata Nilai
                </p>
                <p className="text-3xl font-bold">-</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )}

    {/* Main Section Header */}
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-500  rounded-lg">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nilai Kelas
        </h1>
        <Badge variant="secondary" className="ml-2 bg-cyan-500/30">
          {totalClasses} Kelas
        </Badge>
      </div>
    </div>
  </div>
);

// Enhanced Empty state component
const EmptyState = ({ role }: { role: string }) => (
  <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
    <CardContent className="p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <GraduationCap className="h-8 w-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tidak Ada Kelas Tersedia
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {role === "admin"
              ? "Belum ada kelas yang terdaftar dalam sistem. Tambahkan kelas baru untuk memulai mengelola nilai."
              : "Anda belum memiliki akses ke kelas manapun. Hubungi administrator untuk mendapatkan akses ke kelas."}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ResultListPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Fetch classes with their teachers
  const classes = await prisma.class.findMany({
    include: {
      supervisor: true,
      grade: true,
      lessons: {
        include: {
          teacher: true,
        },
      },
      // Include students for counting
      students: true,
    },
    where:
      role === "admin"
        ? undefined
        : {
            OR: [
              { supervisorId: currentUserId as string },
              {
                lessons: {
                  some: {
                    teacherId: currentUserId as string,
                  },
                },
              },
            ],
          },
  });

  // Calculate stats
  const totalClasses = classes.length;
  const totalStudents = classes.reduce(
    (sum, cls) => sum + cls.students.length,
    0
  );

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        <PageHeader
          role={role || ""}
          totalClasses={totalClasses}
          totalStudents={totalStudents}
        />

        {/* Main Content Section */}
        <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
          <CardContent className=" bg-gray-100 dark:bg-transparent rounded-xl p-0">
            <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
              {classes.length > 0 ? (
                <ClassList
                  classes={classes}
                  role={role || ""}
                  userId={currentUserId || ""}
                />
              ) : (
                <EmptyState role={role || ""} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultListPage;
