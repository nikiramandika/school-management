"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DownloadButtonProps {
  data: {
    existingGrades: Array<{
      id: number;
      score: number;
      examId: number | null;
      assignmentId: number | null;
      studentId: string;
      exam?: {
        title: string;
        lesson: {
          teacher: {
            name: string;
            surname: string;
          };
          class: {
            name: string;
          };
        };
      };
      assignment?: {
        title: string;
        lesson: {
          teacher: {
            name: string;
            surname: string;
          };
          class: {
            name: string;
          };
        };
      };
      student: {
        name: string;
        surname: string;
      };
    }>;
    students: Array<{
      id: string;
      name: string;
      surname: string;
    }>;
    exams?: Array<{
      id: number;
      title: string;
      lesson: {
        teacher: {
          name: string;
          surname: string;
        };
        class: {
          name: string;
        };
      };
    }>;
    assignments?: Array<{
      id: number;
      title: string;
      lesson: {
        teacher: {
          name: string;
          surname: string;
        };
        class: {
          name: string;
        };
      };
    }>;
    className: string;
    type: 'exam' | 'assignment';
  };
}

export const DownloadButton = ({ data }: DownloadButtonProps) => {
  const { existingGrades, className, type } = data;

  const downloadResults = (assessmentId?: number) => {
    let filteredResults = existingGrades;
    let title = '';

    if (assessmentId) {
      if (type === 'exam') {
        const exam = existingGrades.find(grade => grade.examId === assessmentId)?.exam;
        filteredResults = existingGrades.filter(grade => grade.examId === assessmentId);
        title = exam?.title || 'Unknown Exam';
      } else if (type === 'assignment') {
        const assignment = existingGrades.find(grade => grade.assignmentId === assessmentId)?.assignment;
        filteredResults = existingGrades.filter(grade => grade.assignmentId === assessmentId);
        title = assignment?.title || 'Unknown Assignment';
      }
    }

    const formattedResults = filteredResults.map(result => {
      if (type === 'exam' && result.exam) {
        return {
          title: result.exam.title,
          studentName: `${result.student.name} ${result.student.surname}`,
          teacherName: `${result.exam.lesson.teacher.name} ${result.exam.lesson.teacher.surname}`,
          score: result.score,
          className: result.exam.lesson.class.name,
          date: new Date().toLocaleDateString('id-ID'),
        };
      } else if (type === 'assignment' && result.assignment) {
        return {
          title: result.assignment.title,
          studentName: `${result.student.name} ${result.student.surname}`,
          teacherName: `${result.assignment.lesson.teacher.name} ${result.assignment.lesson.teacher.surname}`,
          score: result.score,
          className: result.assignment.lesson.class.name,
          date: new Date().toLocaleDateString('id-ID'),
        };
      }
      return null;
    }).filter(Boolean);

    const blob = new Blob([JSON.stringify(formattedResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = assessmentId 
      ? `hasil_${type === 'exam' ? 'ujian' : 'tugas'}_${title}_${className}_${new Date().toLocaleDateString('id-ID')}.json`
      : `semua_hasil_${type === 'exam' ? 'ujian' : 'tugas'}_${className}_${new Date().toLocaleDateString('id-ID')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Download Hasil
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => downloadResults()}>
          Download Semua Hasil {type === 'exam' ? 'Ujian' : 'Tugas'}
        </DropdownMenuItem>
        {type === 'exam' && existingGrades
          .filter(grade => grade.examId !== null)
          .map(grade => (
            <DropdownMenuItem 
              key={grade.examId} 
              onClick={() => downloadResults(grade.examId!)}
            >
              Download Hasil {grade.exam?.title}
            </DropdownMenuItem>
          ))}
        {type === 'assignment' && existingGrades
          .filter(grade => grade.assignmentId !== null)
          .map(grade => (
            <DropdownMenuItem 
              key={grade.assignmentId} 
              onClick={() => downloadResults(grade.assignmentId!)}
            >
              Download Hasil {grade.assignment?.title}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 