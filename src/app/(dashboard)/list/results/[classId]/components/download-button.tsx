"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);

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

  const downloadResultsPDF = async (assessmentId?: number) => {
    setLoading(true);
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    const logoUrl = "/LogoSMAN5Medan.png";
    const getBase64FromUrl = async (url: string) => {
      const data = await fetch(url);
      const blob = await data.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    };
    const logoBase64 = await getBase64FromUrl(logoUrl);
    doc.addImage(logoBase64, "PNG", 14, 10, 18, 18);

    doc.setFontSize(16);
    doc.text("SMA NEGERI 5 MEDAN", 35, 18);
    doc.setFontSize(10);
    doc.text("Jl. Pelajar No. 17, Medan", 35, 24);
    doc.setFontSize(13);
    doc.text(`Rekapitulasi Nilai Kelas: ${className}`, 14, 38);
    doc.setFontSize(10);
    doc.text(`Tanggal Download: ${new Date().toLocaleDateString("id-ID")}`, 14, 44);

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
    } else {
      if (type === 'exam') {
        filteredResults = existingGrades.filter(grade => grade.examId !== null);
        title = 'Semua Ujian';
      } else if (type === 'assignment') {
        filteredResults = existingGrades.filter(grade => grade.assignmentId !== null);
        title = 'Semua Tugas';
      }
    }

    const tableHead = [
      "Nama Siswa",
      "Nilai",
      "Guru",
      "Kelas"
    ];
    const tableBody = filteredResults.map(result => [
      `${result.student.name} ${result.student.surname}`,
      result.score,
      type === 'exam' && result.exam ? `${result.exam.lesson.teacher.name} ${result.exam.lesson.teacher.surname}` :
      type === 'assignment' && result.assignment ? `${result.assignment.lesson.teacher.name} ${result.assignment.lesson.teacher.surname}` : '-',
      type === 'exam' && result.exam ? result.exam.lesson.class.name :
      type === 'assignment' && result.assignment ? result.assignment.lesson.class.name : '-'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [tableHead],
      body: tableBody,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 }
    });

    doc.setFontSize(9);
    doc.text("Generated by School Management System", 14, doc.internal.pageSize.getHeight() - 10);

    doc.save(
      assessmentId
        ? `hasil_${type === 'exam' ? 'ujian' : 'tugas'}_${title}_${className}_${new Date().toLocaleDateString('id-ID')}.pdf`
        : `semua_hasil_${type === 'exam' ? 'ujian' : 'tugas'}_${className}_${new Date().toLocaleDateString('id-ID')}.pdf`
    );
    setLoading(false);
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
          Download Semua Hasil {type === 'exam' ? 'Ujian' : 'Tugas'} (JSON)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadResultsPDF()}>
          Download Semua Hasil {type === 'exam' ? 'Ujian' : 'Tugas'} (PDF)
        </DropdownMenuItem>
        {type === 'exam' && existingGrades
          .filter(grade => grade.examId !== null)
          .map(grade => (
            <DropdownMenuItem 
              key={grade.examId} 
              onClick={() => downloadResultsPDF(grade.examId!)}
            >
              Download Hasil {grade.exam?.title} (PDF)
            </DropdownMenuItem>
          ))}
        {type === 'assignment' && existingGrades
          .filter(grade => grade.assignmentId !== null)
          .map(grade => (
            <DropdownMenuItem 
              key={grade.assignmentId} 
              onClick={() => downloadResultsPDF(grade.assignmentId!)}
            >
              Download Hasil {grade.assignment?.title} (PDF)
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 