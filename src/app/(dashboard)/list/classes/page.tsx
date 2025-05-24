import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { ClassTable } from "./class-table";

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const query: Prisma.ClassWhereInput = {};

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const data = await prisma.class.findMany({
    where: query,
    include: {
      supervisor: true,
      grade: true,
    },
  });

  // Fetch all teachers for the form
  const allTeachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
  });

  // Get all grades
  const allGrades = await prisma.grade.findMany({
    select: { id: true, level: true },
  });

  // Get all teachers who are already supervisors
  const existingSupervisors = new Set(
    data
      .map(item => item.supervisor?.id)
      .filter((id): id is string => id !== undefined)
  );

  // Add supervisor status to all teachers
  const teachersWithStatus = allTeachers.map(teacher => ({
    ...teacher,
    isSupervisor: existingSupervisors.has(teacher.id)
  }));

  console.log("Page teachers with status:", teachersWithStatus);

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <FormContainer 
                table="class" 
                type="create" 
                relatedData={{
                  teachers: teachersWithStatus,
                  grades: allGrades
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <ClassTable 
        data={data} 
        role={role} 
        allTeachers={teachersWithStatus}
        allGrades={allGrades}
      />
    </div>
  );
};

export default ClassListPage;
