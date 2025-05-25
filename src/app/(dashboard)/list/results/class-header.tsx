"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ClassHeaderProps {
  className: string;
  teacherName?: string;
  teacherSurname?: string;
}

const ClassHeader = ({ className, teacherName, teacherSurname }: ClassHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{className}</h1>
        {(teacherName || teacherSurname) && (
          <p className="text-sm text-muted-foreground">
            Teacher: {teacherName} {teacherSurname}
          </p>
        )}
      </div>
      <Button
        onClick={() => router.push("/list/results")}
        variant="default"
      >
        Back to Classes
      </Button>
    </div>
  );
};

export default ClassHeader; 