import prisma from "@/lib/prisma";
import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
  };

  const data = await modelMap[type].count();

  return (
    <div className="rounded-2xl odd:bg-cyan-500/30 even:bg-indigo-200/90 dark:odd:bg-cyan-500 dark:even:bg-indigo-400/90 p-4 flex-1 min-w-[130px] transition-colors duration-200 shadow-xs">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold bg-white dark:bg-white px-2 py-1 rounded-full text-cyan-500 dark:text-cyan-5 00/90 shadow-xs">
          2024/25
        </span>
        {/* <Image
          src="/more.png"
          alt=""
          width={20}
          height={20}
          className="dark:invert"
        /> */}
      </div>
      <h1 className="text-2xl font-semibold my-4 dark:text-white">{data}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-600 dark:text-gray-200">
        {type}s
      </h2>
    </div>
  );
};

export default UserCard;
