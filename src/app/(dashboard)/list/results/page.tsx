import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import ClassList from "./class-list";

// Header component for better organization
const PageHeader = ({ role }: { role: string }) => (
  <div className="mb-8">
    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Nilai Kelas</h1>
    <p className="mt-2 text-gray-600 dark:text-white">
      {role === "admin" 
        ? "Melihat dan kelola nilai untuk semua kelas" 
        : "Melihat nilai untuk kelas yang ditugaskan"}
    </p>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <p className="text-gray-500">Tidak Ada Kelas yang Tersedia Untuk Ditampilkan</p>
  </div>
);

const ResultListPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Fetch classes with their teachers
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      supervisor: {
        select: {
          id: true,
          name: true,
          surname: true
        }
      },
      lessons: {
        select: {
          teacher: {
            select: {
              id: true,
              name: true,
              surname: true
            }
          }
        }
      }
    },
    where: role === "admin" ? undefined : {
      OR: [
        { supervisorId: currentUserId as string },
        {
          lessons: {
            some: {
              teacherId: currentUserId as string
            }
          }
        }
      ]
    }
  });

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      <div className="bg-card rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <PageHeader role={role || ""} />
        </div>
        
        <div className="px-6 py-5">
          {classes.length > 0 ? (
            <ClassList 
              classes={classes.map(cls => ({
                id: cls.id,
                name: cls.name,
                supervisor: cls.supervisor,
                teachers: cls.lessons.map(lesson => lesson.teacher)
              }))} 
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultListPage;
