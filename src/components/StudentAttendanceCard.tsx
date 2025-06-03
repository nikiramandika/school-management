import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: id,
      date: {
        gte: new Date(new Date().getFullYear(), 0, 1),
      },
    },
  });

  const totalDays = attendance.length;
  const presentDays = attendance.filter((day) => day.status === "PRESENT").length;
  const sickDays = attendance.filter((day) => day.status === "SICK").length;
  const permittedDays = attendance.filter((day) => day.status === "PERMITTED").length;
  const absentDays = attendance.filter((day) => day.status === "ABSENT").length;
  
  // Calculate attendance rate including present, sick, and permitted days
  const attendanceRate = totalDays > 0 ? ((presentDays + sickDays + permittedDays) / totalDays) * 100 : 0;
  
  return (
    <div className="">
      <h1 className="text-xl font-semibold">{attendanceRate.toFixed(1) || "-"}%</h1>
      <span className="text-sm text-gray-400">Absensi</span>
    </div>
  );
};

export default StudentAttendanceCard;
