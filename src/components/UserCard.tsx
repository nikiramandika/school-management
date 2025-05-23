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
    <div className="rounded-2xl odd:bg-lamaPurple/90 even:bg-lamaYellow/90 dark:odd:bg-zinc-800/90 dark:even:bg-zinc-900/90 p-4 flex-1 min-w-[130px] transition-colors duration-200">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-green-600 dark:text-green-400">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={20} height={20} className="dark:invert" />
      </div>
      <h1 className="text-2xl font-semibold my-4 dark:text-white">{data}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500 dark:text-gray-400">{type}s</h2>
    </div>
  );
};

export default UserCard;
