"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, Users, User, Archive } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Student, Lesson, Teacher, Subject, Exam, Assignment, Result } from "@prisma/client";

interface ResultWithTimestamp extends Result {
  updatedAt: Date;
  exam?: Exam;
  assignment?: Assignment;
}

interface LessonWithResults extends Lesson {
  teacher: Teacher;
  subject: Subject | null;
  examResults: ResultWithTimestamp[];
  assignmentResults: ResultWithTimestamp[];
  exams: (Exam & {
    results: ResultWithTimestamp[];
  })[];
  assignments: (Assignment & {
    results: ResultWithTimestamp[];
  })[];
}

interface DownloadReportCardPDFButtonProps {
  students?: Student[];
  lessons?: LessonWithResults[];
  className: string;
  gradeLevel?: number | null;
  classSemester?: string;
}

export default function DownloadReportCardPDFButton({ 
  students = [], 
  lessons = [], 
  className, 
  gradeLevel, 
  classSemester = "GANJIL" 
}: DownloadReportCardPDFButtonProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(classSemester);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [downloadMode, setDownloadMode] = useState<"all" | "selected">("all");

  // Filter lessons based on selected semester
  const filteredLessons = lessons.map(lesson => ({
    ...lesson,
    exams: lesson.exams.filter(exam => !exam.semester || exam.semester === selectedSemester),
    assignments: lesson.assignments.filter(assignment => !assignment.semester || assignment.semester === selectedSemester),
  }));

  // Check if there's data for selected semester
  const hasDataForSemester = filteredLessons.some(lesson => 
    lesson.examResults.length > 0 || lesson.assignmentResults.length > 0
  );
  const isCurrentSemester = selectedSemester === classSemester;

  // Debug logging
  console.log('Download component debug:', {
    students: students.length,
    lessons: lessons.length,
    filteredLessons: filteredLessons.length,
    hasDataForSemester,
    selectedSemester,
    classSemester
  });

  // Calculate student's final grade for each lesson
  const calculateStudentGrade = (studentId: string, lesson: LessonWithResults) => {
    // Get filtered results for the selected semester
    const filteredExamResults = lesson.examResults.filter(result => {
      const exam = lesson.exams.find(e => e.id === result.examId);
      return exam && (!exam.semester || exam.semester === selectedSemester);
    });
    
    const filteredAssignmentResults = lesson.assignmentResults.filter(result => {
      const assignment = lesson.assignments.find(a => a.id === result.assignmentId);
      return assignment && (!assignment.semester || assignment.semester === selectedSemester);
    });

    const studentResults = [
      ...filteredExamResults.filter(result => result.studentId === studentId),
      ...filteredAssignmentResults.filter(result => result.studentId === studentId)
    ];

    if (studentResults.length === 0) return null;

    const average = studentResults.reduce((sum, result) => sum + result.score, 0) / studentResults.length;
    return Math.round(average * 100) / 100;
  };

  // Calculate student's overall average
  const calculateStudentAverage = (studentId: string) => {
    const grades = filteredLessons
      .map(lesson => calculateStudentGrade(studentId, lesson))
      .filter(grade => grade !== null) as number[];

    if (grades.length === 0) return null;
    return Math.round((grades.reduce((sum, grade) => sum + grade, 0) / grades.length) * 100) / 100;
  };

  const handleSelectAllStudents = () => {
    setSelectedStudents(students.map(student => student.id));
  };

  const handleDeselectAllStudents = () => {
    setSelectedStudents([]);
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const generateStudentReport = async (student: Student) => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    // Header dengan logo sekolah
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
    
    let levelLabel = "";
    if (gradeLevel === 1) levelLabel = "X";
    else if (gradeLevel === 2) levelLabel = "XI";
    else if (gradeLevel === 3) levelLabel = "XII";
    
    const kelasText = levelLabel ? `${levelLabel} ${className}` : className;
    doc.text(`RAPOR NILAI SISWA`, 14, 38);
    doc.setFontSize(10);
    doc.text(`Nama: ${student.name} ${student.surname}`, 14, 44);
    doc.text(`Kelas: ${kelasText}`, 14, 50);
    doc.text(`Semester: ${selectedSemester}`, 14, 56);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 62);

    // Prepare data for table
    const tableData = filteredLessons
      .filter(lesson => {
        // Only include lessons that have results for this student in the selected semester
        const studentGrade = calculateStudentGrade(student.id, lesson);
        return studentGrade !== null;
      })
      .map(lesson => {
        const grade = calculateStudentGrade(student.id, lesson);
        const subjectName = lesson.subject?.name || lesson.name;
        const teacherName = `${lesson.teacher.name} ${lesson.teacher.surname}`;
        
        return [
          subjectName,
          teacherName,
          grade ? grade.toString() : "-",
          grade ? (grade >= 75 ? "Baik" : grade >= 60 ? "Cukup" : "Kurang") : "-"
        ];
      });

    // Calculate overall average
    const overallAverage = calculateStudentAverage(student.id);

    // Create table
    autoTable(doc, {
      startY: 70,
      head: [["Mata Pelajaran", "Guru", "Nilai Akhir", "Predikat"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 50 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' }
      }
    });

    // Add summary section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("RINGKASAN NILAI", 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Rata-rata Keseluruhan: ${overallAverage || "-"}`, 14, finalY + 8);
    doc.text(`Jumlah Mata Pelajaran: ${filteredLessons.length}`, 14, finalY + 16);

    // Footer
    doc.setFontSize(9);
    doc.text("Generated by School Management System", 14, doc.internal.pageSize.getHeight() - 10);

    return doc;
  };

  const downloadAsZip = async (studentDocs: { student: Student; doc: any }[]) => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Add each PDF to the zip
    studentDocs.forEach(({ student, doc }) => {
      const pdfBlob = doc.output('blob');
      const fileName = `rapor_${student.name}_${student.surname}_${selectedSemester}_${new Date().toLocaleDateString("id-ID")}.pdf`;
      zip.file(fileName, pdfBlob);
    });

    // Generate and download zip
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `rapor_siswa_${className}_${selectedSemester}_${new Date().toLocaleDateString("id-ID")}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);
  };

  const handleDownloadReports = async () => {
    setLoading(true);
    
    try {
      let studentsToDownload: Student[] = [];
      
      if (downloadMode === "all") {
        studentsToDownload = students;
      } else {
        studentsToDownload = students.filter(student => selectedStudents.includes(student.id));
      }

      if (studentsToDownload.length === 0) {
        alert("Tidak ada siswa yang dipilih untuk didownload");
        setLoading(false);
        return;
      }

      // Check if any student has data
      const studentsWithData = studentsToDownload.filter(student => {
        return filteredLessons.some(lesson => {
          const grade = calculateStudentGrade(student.id, lesson);
          return grade !== null;
        });
      });

      if (studentsWithData.length === 0) {
        alert(`Tidak ada data nilai untuk siswa yang dipilih pada semester ${selectedSemester}`);
        setLoading(false);
        return;
      }

      // Generate all PDFs
      const studentDocs = [];
      for (const student of studentsToDownload) {
        const doc = await generateStudentReport(student);
        studentDocs.push({ student, doc });
      }

      // Download as ZIP if multiple students, single PDF if one student
      if (studentDocs.length === 1) {
        const { student, doc } = studentDocs[0];
        doc.save(`rapor_${student.name}_${student.surname}_${selectedSemester}_${new Date().toLocaleDateString("id-ID")}.pdf`);
      } else {
        await downloadAsZip(studentDocs);
      }

      alert(`Berhasil download ${studentDocs.length} rapor siswa`);

    } catch (error) {
      console.error("Error generating reports:", error);
      alert("Terjadi kesalahan saat membuat rapor");
    }
    
    setLoading(false);
    setShowDialog(false);
    setSelectedStudents([]);
  };

  return (
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

      {!hasDataForSemester && (
        <Badge variant="outline" className="border-yellow-200 text-yellow-700 dark:border-yellow-700 dark:text-yellow-300">
          Tidak ada data nilai untuk semester {selectedSemester}
        </Badge>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download Rapor Siswa
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download Rapor Siswa</DialogTitle>
            <DialogDescription>
              Pilih siswa yang rapor nilainya ingin didownload untuk semester {selectedSemester}
              {!hasDataForSemester && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  ⚠️ Tidak ada data nilai untuk semester {selectedSemester}. Rapor mungkin kosong.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Download Mode Selection */}
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="download-all" 
                  checked={downloadMode === "all"}
                  onCheckedChange={() => setDownloadMode("all")}
                />
                <Label htmlFor="download-all" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Download Semua Siswa ({students.length} siswa) - ZIP
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="download-selected" 
                  checked={downloadMode === "selected"}
                  onCheckedChange={() => setDownloadMode("selected")}
                />
                <Label htmlFor="download-selected" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Pilih Siswa Tertentu
                </Label>
              </div>
            </div>

            {/* Student Selection */}
            {downloadMode === "selected" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAllStudents}
                  >
                    Pilih Semua
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeselectAllStudents}
                  >
                    Hapus Pilihan
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {students.map((student) => {
                    const average = calculateStudentAverage(student.id);
                    return (
                      <div key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                        />
                        <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span>{student.name} {student.surname}</span>
                            <Badge variant="outline" className="ml-2">
                              Rata-rata: {average || "-"}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDialog(false);
                  setSelectedStudents([]);
                }}
              >
                Batal
              </Button>
              <Button 
                onClick={handleDownloadReports}
                disabled={loading || (downloadMode === "selected" && selectedStudents.length === 0)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Membuat Rapor..." : "Download Rapor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 