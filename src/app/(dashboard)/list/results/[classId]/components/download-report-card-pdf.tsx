"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, Users, User, Archive, Edit3, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Student, Lesson, Teacher, Subject, Exam, Assignment, Result } from "@prisma/client";
import { upsertSkillGrade } from "@/lib/actions";
import { toast } from "sonner";

interface SkillGrade {
  id: number;
  score: number;
  studentId: string;
  lessonId: number;
  semester: string;
}

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
  skillGrades?: SkillGrade[];
}

// Interface untuk nilai yang diedit
interface EditedGrades {
  [studentId: string]: {
    [lessonId: number]: {
      knowledge: number | null; // Nilai pengetahuan (rata-rata tugas & ujian)
      skill: number | null;     // Nilai keterampilan
    };
  };
}

export default function DownloadReportCardPDFButton({ 
  students = [], 
  lessons = [], 
  className, 
  gradeLevel, 
  classSemester = "GANJIL",
  skillGrades = []
}: DownloadReportCardPDFButtonProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(classSemester);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [downloadMode, setDownloadMode] = useState<"all" | "selected">("all");
  const [editingMode, setEditingMode] = useState(false);
  const [editedGrades, setEditedGrades] = useState<EditedGrades>({});
  const [savingGrades, setSavingGrades] = useState(false);

  // Filter lessons based on selected semester
  const filteredLessons = lessons.map(lesson => ({
    ...lesson,
    exams: Array.isArray(lesson.exams) ? lesson.exams.filter(exam => !exam.semester || exam.semester === selectedSemester) : [],
    assignments: Array.isArray(lesson.assignments) ? lesson.assignments.filter(assignment => !assignment.semester || assignment.semester === selectedSemester) : [],
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
    classSemester,
    skillGrades: skillGrades.length
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

  // Get skill grade from database
  const getSkillGradeFromDB = (studentId: string, lessonId: number) => {
    const skillGrade = skillGrades.find(sg => 
      sg.studentId === studentId && 
      sg.lessonId === lessonId && 
      sg.semester === selectedSemester
    );
    return skillGrade ? skillGrade.score : null;
  };

  // Calculate student's overall average
  const calculateStudentAverage = (studentId: string) => {
    const grades = filteredLessons
      .map(lesson => calculateStudentGrade(studentId, lesson))
      .filter(grade => grade !== null) as number[];

    if (grades.length === 0) return null;
    return Math.round((grades.reduce((sum, grade) => sum + grade, 0) / grades.length) * 100) / 100;
  };

  // Get edited or calculated grade
  const getStudentGrade = (studentId: string, lesson: LessonWithResults) => {
    if (editingMode && editedGrades[studentId]?.[lesson.id]?.knowledge !== undefined) {
      return editedGrades[studentId][lesson.id].knowledge;
    }
    return calculateStudentGrade(studentId, lesson);
  };

  // Get edited or database skill grade
  const getStudentSkillGrade = (studentId: string, lesson: LessonWithResults) => {
    if (editingMode && editedGrades[studentId]?.[lesson.id]?.skill !== undefined) {
      return editedGrades[studentId][lesson.id].skill;
    }
    // Get from database, fallback to knowledge grade if not found
    const dbSkillGrade = getSkillGradeFromDB(studentId, lesson.id);
    if (dbSkillGrade !== null) {
      return dbSkillGrade;
    }
    return calculateStudentGrade(studentId, lesson);
  };

  // Handle grade editing
  const handleGradeChange = (studentId: string, lessonId: number, type: 'knowledge' | 'skill', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    
    setEditedGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [lessonId]: {
          ...prev[studentId]?.[lessonId],
          [type]: numValue
        }
      }
    }));
  };

  // Initialize edited grades
  const initializeEditedGrades = () => {
    const initial: EditedGrades = {};
    students.forEach(student => {
      initial[student.id] = {};
      filteredLessons.forEach(lesson => {
        const knowledgeGrade = calculateStudentGrade(student.id, lesson);
        const skillGrade = getSkillGradeFromDB(student.id, lesson.id) || knowledgeGrade;
        initial[student.id][lesson.id] = {
          knowledge: knowledgeGrade,
          skill: skillGrade
        };
      });
    });
    setEditedGrades(initial);
  };

  // Save edited grades to database
  const handleSaveEditedGrades = async () => {
    setSavingGrades(true);
    
    try {
      const savePromises: Promise<any>[] = [];
      
      Object.entries(editedGrades).forEach(([studentId, lessonGrades]) => {
        Object.entries(lessonGrades).forEach(([lessonId, grades]) => {
          if (grades.skill !== null && grades.skill !== undefined) {
            savePromises.push(
              upsertSkillGrade(
                { success: false, error: false, message: "" },
                {
                  studentId,
                  lessonId: parseInt(lessonId),
                  score: grades.skill,
                  semester: selectedSemester,
                }
              )
            );
          }
        });
      });

      if (savePromises.length > 0) {
        await Promise.all(savePromises);
        toast.success("Nilai keterampilan berhasil disimpan ke database");
      } else {
        toast.info("Tidak ada nilai keterampilan yang perlu disimpan");
      }
      
    } catch (error) {
      console.error("Error saving skill grades:", error);
      toast.error("Gagal menyimpan nilai keterampilan");
    } finally {
      setSavingGrades(false);
    }
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

    // Siapkan label kelas
    let levelLabel = "";
    if (gradeLevel === 1) levelLabel = "X";
    else if (gradeLevel === 2) levelLabel = "XI";
    else if (gradeLevel === 3) levelLabel = "XII";
    const kelasText = levelLabel ? `${levelLabel} ${className}` : className;

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

    // Header dua kolom
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("Nama Sekolah", 35, 16);
    doc.text(": SMA Negeri 5 Medan", 65, 16);
    doc.text("Kelas", 140, 16);
    doc.text(": " + kelasText, 160, 16);

    doc.setFont('helvetica', 'normal');
    doc.text("Alamat", 35, 22);
    doc.text(": Jl. Pelajar No. 17, Medan", 65, 22);
    doc.text("Semester", 140, 22);
    doc.text(": " + selectedSemester, 160, 22);

    doc.text("Nama Siswa", 35, 28);
    doc.text(": " + student.name + " " + student.surname, 65, 28);
    doc.text("Tahun Pelajaran", 140, 28);
    doc.text(": " + new Date().getFullYear() + "/" + (new Date().getFullYear() + 1), 160, 28);

    // Cek NISN jika ada di student, jika tidak ada pakai '-'
    const nisn = (student as any).username || "-";
    doc.text("NISN", 35, 34);
    doc.text(": " + nisn, 65, 34);

    // Prepare data for table
    const tableData = filteredLessons.map((lesson, idx) => {
      const knowledgeGrade = getStudentGrade(student.id, lesson);
      const skillGrade = getStudentSkillGrade(student.id, lesson);
      const subjectName = lesson.subject?.name || lesson.name;
      
      let knowledgePredikat = "-";
      let skillPredikat = "-";
      let knowledgeDescription = "-";
      let skillDescription = "-";
      
      if (knowledgeGrade !== null) {
        if (knowledgeGrade >= 90) {
          knowledgePredikat = "A";
          knowledgeDescription = "Sudah menguasai semua kompetensi dengan sangat baik, mampu memahami dan menerapkan materi secara menyeluruh.";
        } else if (knowledgeGrade >= 75) {
          knowledgePredikat = "B";
          knowledgeDescription = "Sudah menguasai kompetensi dengan baik, mampu memahami materi dan menerapkannya dengan cukup baik.";
        } else if (knowledgeGrade >= 60) {
          knowledgePredikat = "C";
          knowledgeDescription = "Menguasai sebagian kompetensi, namun masih perlu meningkatkan pemahaman dan penerapan materi.";
        } else {
          knowledgePredikat = "D";
          knowledgeDescription = "Belum menguasai kompetensi, perlu bimbingan lebih lanjut.";
        }
      }

      if (skillGrade !== null) {
        if (skillGrade >= 90) {
          skillPredikat = "A";
          skillDescription = "Sangat terampil dalam menerapkan konsep dan prinsip yang dipelajari.";
        } else if (skillGrade >= 75) {
          skillPredikat = "B";
          skillDescription = "Terampil dalam menerapkan konsep dan prinsip yang dipelajari.";
        } else if (skillGrade >= 60) {
          skillPredikat = "C";
          skillDescription = "Cukup terampil dalam menerapkan konsep dan prinsip yang dipelajari.";
        } else {
          skillPredikat = "D";
          skillDescription = "Kurang terampil dalam menerapkan konsep dan prinsip yang dipelajari.";
        }
      }

      return [
        (idx + 1).toString(),
        subjectName,
        knowledgeGrade !== null ? knowledgeGrade.toString() : "-",
        knowledgePredikat,
        skillGrade !== null ? skillGrade.toString() : "-",
        skillPredikat,
        knowledgeDescription,
        skillDescription
      ];
    });

    // Calculate overall average
    const knowledgeGrades = filteredLessons
      .map(lesson => getStudentGrade(student.id, lesson))
      .filter(grade => grade !== null) as number[];
    
    const skillGrades = filteredLessons
      .map(lesson => getStudentSkillGrade(student.id, lesson))
      .filter(grade => grade !== null) as number[];

    const knowledgeAverage = knowledgeGrades.length > 0 
      ? Math.round((knowledgeGrades.reduce((sum, grade) => sum + grade, 0) / knowledgeGrades.length) * 100) / 100
      : null;
    
    const skillAverage = skillGrades.length > 0 
      ? Math.round((skillGrades.reduce((sum, grade) => sum + grade, 0) / skillGrades.length) * 100) / 100
      : null;

    // Create table
    autoTable(doc, {
      startY: 42,
      head: [["No", "Mata Pelajaran", "Nilai Pengetahuan", "Predikat", "Nilai Keterampilan", "Predikat", "Deskripsi Pengetahuan", "Deskripsi Keterampilan"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 35 },
        7: { cellWidth: 35 }
      }
    });

    // Add summary section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("RINGKASAN NILAI", 14, finalY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rata-rata Pengetahuan: ${knowledgeAverage || "-"}`, 14, finalY + 8);
    doc.text(`Rata-rata Keterampilan: ${skillAverage || "-"}`, 14, finalY + 16);
    doc.text(`Jumlah Mata Pelajaran: ${filteredLessons.length}`, 14, finalY + 24);

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
          const grade = getStudentGrade(student.id, lesson);
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
    setEditingMode(false);
    setEditedGrades({});
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

            {/* Edit Mode Toggle */}
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Checkbox 
                id="edit-mode" 
                checked={editingMode}
                onCheckedChange={(checked) => {
                  setEditingMode(checked === true);
                  if (checked === true) {
                    initializeEditedGrades();
                  } else {
                    setEditedGrades({});
                  }
                }}
              />
              <Label htmlFor="edit-mode" className="flex items-center gap-2 font-medium">
                <Edit3 className="h-4 w-4" />
                Edit Nilai Sebelum Download
              </Label>
              {editingMode && (
                <Badge variant="outline" className="ml-2 border-blue-200 text-blue-700">
                  Mode Edit Aktif
                </Badge>
              )}
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

            {/* Grade Editing Section */}
            {editingMode && (
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Edit Nilai Siswa</h3>
                  <Button 
                    onClick={handleSaveEditedGrades}
                    disabled={savingGrades}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingGrades ? "Menyimpan..." : "Simpan Nilai Keterampilan"}
                  </Button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <div key={student.id} className="border rounded-lg p-3 bg-white dark:bg-gray-800">
                      <h4 className="font-medium mb-3">{student.name} {student.surname}</h4>
                      <div className="space-y-2">
                        {filteredLessons.map((lesson) => {
                          const knowledgeGrade = getStudentGrade(student.id, lesson);
                          const skillGrade = getStudentSkillGrade(student.id, lesson);
                          const subjectName = lesson.subject?.name || lesson.name;
                          
                          return (
                            <div key={lesson.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{subjectName}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Label className="text-xs">Pengetahuan:</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={knowledgeGrade?.toString() || ""}
                                    onChange={(e) => handleGradeChange(student.id, lesson.id, 'knowledge', e.target.value)}
                                    className="w-16 h-8 text-center text-xs"
                                    placeholder="0-100"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Label className="text-xs">Keterampilan:</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={skillGrade?.toString() || ""}
                                    onChange={(e) => handleGradeChange(student.id, lesson.id, 'skill', e.target.value)}
                                    className="w-16 h-8 text-center text-xs"
                                    placeholder="0-100"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
                  setEditingMode(false);
                  setEditedGrades({});
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