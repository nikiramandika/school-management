import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import ClassList from "./class-list";

// Header component for better organization
const PageHeader = ({ role }: { role: string }) => (
  <div className="mb-8">
    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Class Results</h1>
    <p className="mt-2 text-gray-600 dark:text-white">
      {role === "admin" 
        ? "View and manage results for all classes" 
        : "View results for your assigned classes"}
    </p>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <p className="text-gray-500">No classes available to display</p>
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
    }
  });

  // Filter classes based on role
  const filteredClasses = role === "admin" 
    ? classes 
    : classes.filter(cls => 
        cls.lessons.some(lesson => lesson.teacher.id === currentUserId)
      );

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      <div className="bg-card rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <PageHeader role={role || ""} />
        </div>
        
        <div className="px-6 py-5">
          {filteredClasses.length > 0 ? (
            <ClassList 
              classes={filteredClasses.map(cls => ({
                id: cls.id,
                name: cls.name,
                teacher: cls.lessons[0]?.teacher
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
