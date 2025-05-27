'use client';

import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Teacher {
  id: string;
  name: string;
  surname: string;
}

interface Class {
  id: number;
  name: string;
  supervisor: Teacher | null;
  teachers: Teacher[];
}

interface ClassListProps {
  classes: Class[];
}

const ClassList = ({ classes }: ClassListProps) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {classes.map((cls) => (
        <Card
          key={cls.id}
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => router.push(`/list/results/${cls.id}`)}
        >
          <h3 className="text-lg font-semibold">{cls.name}</h3>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              Wali Kelas: {cls.supervisor ? `${cls.supervisor.name} ${cls.supervisor.surname}` : 'Not assigned'}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ClassList; 