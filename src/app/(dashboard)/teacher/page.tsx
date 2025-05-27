import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const TeacherPage = async () => {
  const { userId } = await auth();

  const lessons = await prisma.lesson.findMany({
    where: {
      teacherId: userId!,
    },
  });

  const initialData = lessons.map((lesson) => ({
    title: lesson.name,
    start: lesson.startTime,
    end: lesson.endTime,
    day: lesson.day,
  }));

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-gray-50 dark:bg-card p-4 rounded-md shadow-sm">
          <h1 className="text-xl font-semibold mb-4">Jadwal Mengajar</h1>
          <div className="h-[calc(100%-3rem)]">
            <BigCalendarContainer 
              type="teacherId" 
              id={userId!} 
              initialData={initialData}
            />
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-gray-50 dark:bg-card p-4 rounded-md shadow-sm">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
