"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Student {
  id: string;
  name: string;
  surname: string;
}
interface Assessment {
  id: string;
  title: string;
  type: "Ujian" | "Tugas";
}
interface Grade {
  studentId: string;
  assessmentId: string;
  score: number;
}

interface DownloadAllResultsPDFButtonProps {
  students?: Student[];
  exams?: Assessment[];
  assignments?: Assessment[];
  existingGrades?: Grade[];
  className: string;
  gradeLevel?: number | null;
  classSemester?: string;
}

export default function DownloadAllResultsPDFButton({ students = [], exams = [], assignments = [], existingGrades = [], className, gradeLevel, classSemester = "GANJIL" }) {
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(classSemester);
  const [showSemesterSelect, setShowSemesterSelect] = useState(false);

  // Filter assessments and grades based on selected semester
  const filteredExams = exams.filter(exam => {
    if (!exam.semester) return true;
    return exam.semester === selectedSemester;
  });
  const filteredAssignments = assignments.filter(assignment => {
    if (!assignment.semester) return true;
    return assignment.semester === selectedSemester;
  });
  const filteredGrades = existingGrades.filter(grade => {
    const assessmentId = grade.assessmentId;
    const isExam = assessmentId.startsWith('E-');
    const isAssignment = assessmentId.startsWith('A-');
    if (isExam) {
      const examId = assessmentId.replace('E-', '');
      return filteredExams.some(exam => exam.id === examId);
    } else if (isAssignment) {
      const assignmentId = assessmentId.replace('A-', '');
      return filteredAssignments.some(assignment => assignment.id === assignmentId);
    }
    return false;
  });

  // Only use filtered data, no fallback
  const finalExams = filteredExams;
  const finalAssignments = filteredAssignments;
  const finalGrades = filteredGrades;

  // Check if both are empty for selected semester
  const noDataForSemester = finalExams.length === 0 && finalAssignments.length === 0;
  const isCurrentSemester = selectedSemester === classSemester;

  const handleDownloadAllPDF = async () => {
    setLoading(true);
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    // Header dengan logo sekolah
    const logoUrl = "/LogoSMAN5Medan.png";
    // Load image as base64
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
    let levelLabel = "";
    if (gradeLevel === 1) levelLabel = "X";
    else if (gradeLevel === 2) levelLabel = "XI";
    else if (gradeLevel === 3) levelLabel = "XII";
    const kelasText = levelLabel ? `${levelLabel} ${className}` : className;
    doc.text(`Rekapitulasi Nilai Kelas: ${kelasText}`, 14, 38);
    doc.setFontSize(10);
    doc.text(`Semester: ${selectedSemester}`, 14, 44);
    doc.text(`Tanggal Download: ${new Date().toLocaleDateString("id-ID")}`, 14, 50);

    // Gabungkan semua assessment dengan prefix pada id
    const allAssessments: Assessment[] = [
      ...finalExams.map(e => ({ ...e, id: `E-${e.id}`, type: "Ujian" as const })),
      ...finalAssignments.map(a => ({ ...a, id: `A-${a.id}`, type: "Tugas" as const })),
    ];

    // Header tabel: Nama Siswa, ...judul assessment, Rata-rata
    const tableHead = [
      "Nama Siswa",
      ...allAssessments.map(a => `${a.type}: ${a.title}`),
      "Rata-rata"
    ];

    // Data tabel: setiap baris = siswa, kolom = nilai assessment + rata-rata
    const tableBody = students.map(student => {
      const scores = allAssessments.map(assess => {
        const grade = existingGrades.find(g => g.studentId === student.id && g.assessmentId === assess.id);
        return grade ? grade.score : "-";
      });
      // Hitung rata-rata (hanya nilai numerik)
      const numericScores = scores.filter(s => typeof s === "number") as number[];
      const avg = numericScores.length ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2) : "-";
      return [
        `${student.name} ${student.surname}`,
        ...scores,
        avg
      ];
    });

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

    // Footer
    doc.setFontSize(9);
    doc.text("Generated by School Management System", 14, doc.internal.pageSize.getHeight() - 10);

    doc.save(`rekap_nilai_${className}_${new Date().toLocaleDateString("id-ID")}.pdf`);
    setLoading(false);
    setShowSemesterSelect(false);
  };

  return (
    <div className="flex items-center gap-2">
      {showSemesterSelect ? (
        <div className="flex items-center gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GANJIL">GANJIL</SelectItem>
              <SelectItem value="GENAP">GENAP</SelectItem>
            </SelectContent>
          </Select>
          <Badge
            variant="outline"
            className={isCurrentSemester 
              ? "border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300" 
              : "border-green-200 text-green-700 dark:border-green-700 dark:text-green-300"
            }
          >
            {isCurrentSemester ? "Semester Saat Ini" : "Semester Lain"}
          </Badge>
          {noDataForSemester && (
            <Badge variant="outline" className="border-yellow-200 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300">
              Tidak ada data ujian atau tugas untuk semester {selectedSemester}
            </Badge>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    onClick={handleDownloadAllPDF} 
                    disabled={loading || noDataForSemester} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? "Membuat PDF..." : "Download"}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {noDataForSemester 
                  ? "Tidak ada ujian atau tugas yang tersedia untuk diunduh" 
                  : loading 
                    ? "Membuat PDF..." 
                    : `Download rekap nilai semester ${selectedSemester}`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            variant="outline" 
            onClick={() => setShowSemesterSelect(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            Batal
          </Button>
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  onClick={() => setShowSemesterSelect(true)} 
                  disabled={exams.length === 0 && assignments.length === 0} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Rekap PDF
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {exams.length === 0 && assignments.length === 0
                ? "Tidak ada ujian atau tugas yang tersedia untuk diunduh"
                : "Pilih semester untuk download rekap nilai"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
} 