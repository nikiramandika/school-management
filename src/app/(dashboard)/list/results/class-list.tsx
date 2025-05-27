"use client";

import { Class, Teacher, Grade } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Users } from "lucide-react";
import Link from "next/link";

type ClassWithRelations = Class & {
  supervisor: Teacher | null;
  grade: Grade | null;
};

type ClassListProps = {
  classes: ClassWithRelations[];
  role?: string;
  userId?: string;
};

export default function ClassList({ classes, role, userId }: ClassListProps) {
  // Separate supervised classes from teaching classes
  const supervisedClasses = classes.filter(
    (classItem) => classItem.supervisorId === userId
  );
  const teachingClasses = classes.filter(
    (classItem) => classItem.supervisorId !== userId
  );

  return (
    <div className="space-y-6">
      {/* Supervised Classes Section */}
      {role === "teacher" && supervisedClasses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Kelas yang Saya Bimbing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supervisedClasses.map((classItem) => (
              <Card key={classItem.id} className="border-2 border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {classItem.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/list/results/${classItem.id}`}>
                        <BarChart2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/list/classes/${classItem.id}`}>
                        <Users className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Tingkat {classItem.grade?.level}</p>
                    <p>Kapasitas: {classItem.capacity} siswa</p>
                    <p className="text-primary font-medium mt-2">Wali Kelas</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Teaching Classes Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {role === "teacher" && supervisedClasses.length > 0
            ? "Kelas yang Saya Ajar"
            : "Semua Kelas"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachingClasses.map((classItem) => (
            <Card key={classItem.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {classItem.name}
                </CardTitle>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/list/results/${classItem.id}`}>
                    <BarChart2 className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Tingkat {classItem.grade?.level}</p>
                  <p>Kapasitas: {classItem.capacity} siswa</p>
                  <p>Wali Kelas: {classItem.supervisor?.name} {classItem.supervisor?.surname}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 