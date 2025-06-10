import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { StudentTable } from "./student-table";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HiUserGroup } from "react-icons/hi";
interface ClassStudentsPageProps {
  params: {
    classId: string;
  };
}

const ClassStudentsPage = async ({ params }: ClassStudentsPageProps) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // ⬇⬇ Lanjutkan logika backend di sini ⬇⬇
  const classId = parseInt(params.classId);
  if (isNaN(classId)) notFound();

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: true,
      grade: {
        select: {
          level: true,
        },
      },
    },
  });

  if (!classData) notFound();

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500  rounded-lg">
            <HiUserGroup className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Daftar Siswa - {classData.grade?.level === 1 ? "X" : classData.grade?.level === 2 ? "XI" : "XII"} {classData.name}
            </h1>
          </div>
          <Badge variant="secondary" className="ml-2 bg-cyan-500/30">
            {classData.students.length} Siswa
          </Badge>
        </div>

        {/* Table Section */}
        <Card className="text-card-foreground border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
          <CardContent className="bg-gray-100 dark:bg-transparent rounded-xl p-0">
            <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
              <StudentTable data={classData.students} role={role} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassStudentsPage;
