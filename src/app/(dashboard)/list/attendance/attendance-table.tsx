"use client"

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Pencil, Save, AlertCircle } from 'lucide-react';
import { createAttendance, updateAttendance } from '@/lib/actions';
import { toast } from 'react-toastify';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

interface Student {
  id: string;
  name: string;
  surname: string;
  class: {
    id: number;
    name: string;
  };
}

interface Lesson {
  id: number;
  name: string;
  class: {
    name: string;
  };
  teacher: {
    id: string;
    name: string;
    surname: string;
  };
}

interface Attendance {
  id: number;
  date: Date;
  present: boolean;
  studentId: string;
  lessonId: number;
  lesson: {
    name: string;
    teacher: {
      id: string;
      name: string;
      surname: string;
    };
  };
}

interface AttendanceTableProps {
  students: Student[];
  lessons: Lesson[];
  role?: string;
  currentUserId?: string;
  existingAttendances: Attendance[];
}

export function AttendanceTable({ students, lessons, role, currentUserId, existingAttendances }: AttendanceTableProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize attendance status from existing records when lesson and date are selected
  useEffect(() => {
    if (selectedLesson && selectedDate) {
      const initialStatus: Record<string, boolean> = {};
      existingAttendances
        .filter(attendance => 
          attendance.lessonId === parseInt(selectedLesson) && 
          format(new Date(attendance.date), 'yyyy-MM-dd') === selectedDate
        )
        .forEach(attendance => {
          initialStatus[attendance.studentId] = attendance.present;
        });
      setAttendanceStatus(initialStatus);
      setIsEditing(false);
      setHasChanges(false);
    }
  }, [selectedLesson, selectedDate, existingAttendances]);

  const handleAttendanceChange = (studentId: string, value: boolean) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: value
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (!selectedLesson) {
      toast.error('Please select a lesson first');
      return;
    }

    try {
      const savePromises = Object.entries(attendanceStatus).map(async ([studentId, present]) => {
        const existingAttendance = existingAttendances.find(
          attendance => 
            attendance.lessonId === parseInt(selectedLesson) && 
            attendance.studentId === studentId &&
            format(new Date(attendance.date), 'yyyy-MM-dd') === selectedDate
        );

        const formData = {
          studentId,
          present,
          date: new Date(selectedDate),
          id: existingAttendance ? existingAttendance.id : 0,
          lessonId: parseInt(selectedLesson)
        };

        return existingAttendance 
          ? updateAttendance({ success: false, error: false, message: "" }, formData)
          : createAttendance({ success: false, error: false, message: "" }, formData);
      });

      const results = await Promise.all(savePromises);
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        toast.success('Attendance saved successfully');
        setIsEditing(false);
        setHasChanges(false);
        router.refresh();
      } else {
        toast.error('Some attendance records failed to save');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Filter lessons based on role and current user
  const filteredLessons = role === "admin" 
    ? lessons 
    : lessons.filter(lesson => lesson.teacher.id === currentUserId);

  const selectedLessonDetails = filteredLessons.find(
    lesson => lesson.id.toString() === selectedLesson
  );

  return (
    <Card className="p-4">
      <div className="mb-4 space-y-4">
        <div className="flex gap-4 items-center">
          <Select
            value={selectedLesson}
            onValueChange={setSelectedLesson}
            disabled={filteredLessons.length === 0}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder={
                filteredLessons.length === 0 
                  ? "No lessons available" 
                  : "Select lesson"
              } />
            </SelectTrigger>
            <SelectContent>
              {filteredLessons.map((lesson) => (
                <SelectItem key={lesson.id} value={lesson.id.toString()}>
                  {lesson.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />

          {selectedLesson && (
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Attendance
                </Button>
              ) : (
                <Button
                  onClick={handleSaveAll}
                  disabled={!hasChanges}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save All
                </Button>
              )}
            </div>
          )}
        </div>

        {selectedLessonDetails && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{selectedLessonDetails.name}</h3>
            <p className="text-sm text-muted-foreground">
              Teacher: {selectedLessonDetails.teacher.name} {selectedLessonDetails.teacher.surname}
            </p>
          </div>
        )}
      </div>

      {!selectedLesson ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <p className="text-lg font-medium">Please select a lesson first</p>
            <p className="text-sm">Choose a lesson from the dropdown above to view and manage attendance</p>
          </div>
        </div>
      ) : filteredLessons.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const existingAttendance = existingAttendances.find(
                  attendance => 
                    attendance.lessonId === parseInt(selectedLesson) && 
                    attendance.studentId === student.id &&
                    format(new Date(attendance.date), 'yyyy-MM-dd') === selectedDate
                );

                return (
                  <tr key={student.id} className="border-b">
                    <td className="p-2">
                      {student.name} {student.surname}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={attendanceStatus[student.id] || false}
                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {attendanceStatus[student.id] ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      ) : (
                        existingAttendance ? (
                          <span className={`px-2 py-1 rounded ${existingAttendance.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {existingAttendance.present ? 'Present' : 'Absent'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No lessons available for this class
        </div>
      )}
    </Card>
  );
} 