"use client";

import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Class {
  id: number;
  name: string;
}

interface ClassListProps {
  classes: Class[];
}

export default function ClassList({ classes }: ClassListProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {classes.map((classItem) => (
        <Card
          key={classItem.id}
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => router.push(`/list/attendance/${classItem.id}`)}
        >
          <h3 className="text-lg font-semibold">{classItem.name}</h3>
          <p className="text-sm text-gray-500">Lihat Absensi</p>
        </Card>
      ))}
    </div>
  );
} 

