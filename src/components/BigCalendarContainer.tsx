import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
  initialData,
}: {
  type: "teacherId" | "classId";
  id: string | number;
  initialData?: { title: string; start: Date; end: Date }[];
}) => {
  let data;
  
  if (initialData) {
    data = initialData;
  } else {
    const dataRes = await prisma.lesson.findMany({
      where: {
        ...(type === "teacherId"
          ? { teacherId: id as string }
          : { classId: id as number }),
      },
    });

    data = dataRes.map((lesson) => ({
      title: lesson.name,
      start: lesson.startTime,
      end: lesson.endTime,
    }));
  }

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="h-full">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
