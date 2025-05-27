import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { StudentTable } from "./student-table";
import { notFound } from "next/navigation";

interface ClassStudentsPageProps {
  params: {
    classId: string;
  };
}

const ClassStudentsPage = async ({ params }: ClassStudentsPageProps) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Parse classId as integer
  const classId = parseInt(params.classId);
  
  if (isNaN(classId)) {
    notFound();
  }

  // Fetch class details
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      grade: true,
      supervisor: true,
    },
  });

  if (!classData) {
    notFound();
  }

  // Fetch students in this class
  const students = await prisma.student.findMany({
    where: {
      classId: classId,
    },
  });

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold">Daftar Siswa Kelas {classData.name}</h1>
          <p className="text-sm text-muted-foreground">
            Tingkat {classData.grade?.level} - Wali Kelas: {classData.supervisor?.name} {classData.supervisor?.surname}
          </p>
        </div>
      </div>
      {/* LIST */}
      <StudentTable data={students} role={role} />
    </div>
  );
};

export default ClassStudentsPage; 