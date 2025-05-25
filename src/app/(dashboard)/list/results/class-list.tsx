'use client';

import { useRouter } from 'next/navigation';

interface Teacher {
  id: string;
  name: string;
  surname: string;
}

interface Class {
  id: number;
  name: string;
  teacher?: Teacher;
}

interface ClassListProps {
  classes: Class[];
}

const ClassList = ({ classes }: ClassListProps) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map((cls) => (
        <div
          key={cls.id}
          className="p-4 bg-gray-50 dark:bg-black rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          onClick={() => router.push(`/list/results/${cls.id}`)}
        >
          <h3 className="font-semibold text-lg mb-2">{cls.name}</h3>
          {cls.teacher && (
            <p className="text-sm text-muted-foreground">
              Teacher: {cls.teacher.name} {cls.teacher.surname}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClassList; 