'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Pencil, 
  Save, 
  AlertCircle, 
  User, 
  Calendar,
  BookOpen,
  BarChart2,
  FileText,
  Users,
  Trophy,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { createResult, updateResult } from '@/lib/actions';
import { toast } from 'react-toastify';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  surname: string;
  className: string;
}

interface Assessment {
  id: string;
  title: string;
  className: string;
  teacherId: string;
  date?: string;
  description?: string;
}

interface Grade {
  id: string;
  score: number;
  assessmentId: string;
  studentId: string;
}

interface StudentTableProps {
  students: Student[];
  exams: Assessment[];
  assignments: Assessment[];
  role?: string;
  currentUserId?: string;
  existingGrades: Grade[];
}

const StudentTable = ({ students, exams, assignments, role, currentUserId, existingGrades }: StudentTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isExamPage = pathname.includes('/exam');
  const assessments = isExamPage ? exams : assignments;
  const assessmentType = isExamPage ? 'Ujian' : 'Tugas';

  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [editingGrades, setEditingGrades] = useState<Record<string, boolean>>({});

  // Initialize scores from existing grades when assessment is selected
  useEffect(() => {
    if (selectedAssessment) {
      const initialScores: Record<string, string> = {};
      existingGrades
        .filter(grade => grade.assessmentId === selectedAssessment)
        .forEach(grade => {
          initialScores[grade.studentId] = grade.score.toString();
        });
      setScores(initialScores);
    }
  }, [selectedAssessment, existingGrades]);

  const handleScoreChange = (studentId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSave = async (studentId: string) => {
    if (!selectedAssessment || !scores[studentId]) {
      console.log('Missing required data:', { selectedAssessment, score: scores[studentId] });
      return;
    }

    try {
      console.log('Starting save process for student:', studentId);
      console.log('Current scores:', scores);
      console.log('Selected assessment:', selectedAssessment);

      const existingGrade = existingGrades.find(
        grade => grade.assessmentId === selectedAssessment && grade.studentId === studentId
      );
      console.log('Existing grade:', existingGrade);

      // Parse and validate score
      const score = parseFloat(scores[studentId]);
      if (isNaN(score) || score < 0 || score > 100) {
        toast.error('Score must be a number between 0 and 100');
        return;
      }

      const formData = {
        studentId,
        score,
        id: existingGrade ? parseInt(existingGrade.id) : 0,
        ...(isExamPage 
          ? { examId: parseInt(selectedAssessment) }
          : { assignmentId: parseInt(selectedAssessment) }
        )
      };

      console.log('Sending form data:', formData);

      const result = existingGrade 
        ? await updateResult({ success: false, error: false, message: "" }, formData)
        : await createResult({ success: false, error: false, message: "" }, formData);

      console.log('Server response:', result);

      if (result.success) {
        toast.success(result.message);
        // Clear editing state
        setEditingGrades(prev => {
          const newState = { ...prev };
          delete newState[studentId];
          return newState;
        });
        // Clear the score
        setScores(prev => {
          const newScores = { ...prev };
          delete newScores[studentId];
          return newScores;
        });
        // Refresh the page to show updated data
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to save grade');
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Failed to save grade. Please try again.');
    }
  };

  const handleEdit = (studentId: string) => {
    setEditingGrades(prev => ({
      ...prev,
      [studentId]: true
    }));
  };

  const handleCancel = (studentId: string) => {
    setEditingGrades(prev => {
      const newState = { ...prev };
      delete newState[studentId];
      return newState;
    });
    // Reset score to original value
    const existingGrade = existingGrades.find(
      grade => grade.assessmentId === selectedAssessment && grade.studentId === studentId
    );
    if (existingGrade) {
      setScores(prev => ({
        ...prev,
        [studentId]: existingGrade.score.toString()
      }));
    } else {
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[studentId];
        return newScores;
      });
    }
  };

  // Filter assessments based on role and current user
  const filteredAssessments = role === "admin" 
    ? assessments 
    : assessments.filter(assessment => assessment.teacherId === currentUserId);

  const selectedAssessmentDetails = filteredAssessments.find(
    assessment => assessment.id === selectedAssessment
  );

  // Get grade statistics
  const currentGrades = existingGrades.filter(grade => grade.assessmentId === selectedAssessment);
  const averageScore = currentGrades.length > 0 
    ? (currentGrades.reduce((sum, grade) => sum + grade.score, 0) / currentGrades.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200 dark:border-purple-800">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                {isExamPage ? (
                  <BarChart2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manajemen Nilai {assessmentType}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2">
              {isExamPage ? (
                <BarChart2 className="h-4 w-4 text-purple-600" />
              ) : (
                <FileText className="h-4 w-4 text-purple-600" />
              )}
              <Select
                value={selectedAssessment}
                onValueChange={setSelectedAssessment}
                disabled={filteredAssessments.length === 0}
              >
                <SelectTrigger className="w-[320px] border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder={
                    filteredAssessments.length === 0 
                      ? `Tidak ada ${assessmentType} yang tersedia` 
                      : `Pilih ${assessmentType}`
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredAssessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      <div className="flex items-center gap-2">
                        
                        {assessment.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAssessmentDetails?.date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <Badge variant="outline" className="border-indigo-200 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300">
                  {format(new Date(selectedAssessmentDetails.date), 'dd MMM yyyy')}
                </Badge>
              </div>
            )}
          </div>

          {selectedAssessmentDetails && (
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                      {isExamPage ? (
                        <BarChart2 className="mr-1 h-3 w-3" />
                      ) : (
                        <FileText className="mr-1 h-3 w-3" />
                      )}
                      {selectedAssessmentDetails.title}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                      <Users className="mr-1 h-3 w-3" />
                      {selectedAssessmentDetails.className}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                      <Trophy className="mr-1 h-3 w-3" />
                      Rata-rata: {averageScore}
                    </Badge>
                  </div>
                </div>
              </div>
              {selectedAssessmentDetails.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {selectedAssessmentDetails.description}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Main Content */}
      <Card className="overflow-hidden">
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                {isExamPage ? (
                  <BarChart2 className="h-8 w-8 text-gray-400" />
                ) : (
                  <FileText className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Tidak ada {assessmentType} tersedia
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tidak ada {assessmentType.toLowerCase()} yang tersedia untuk kelas ini
                </p>
              </div>
            </div>
          </div>
        ) : !selectedAssessment ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Silakan pilih {assessmentType.toLowerCase()} terlebih dahulu
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pilih {assessmentType.toLowerCase()} dari menu dropdown di atas untuk melihat dan mengelola nilai
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Daftar Nilai Siswa
                  </h3>
                  <Badge variant="outline" className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300">
                    {students.length} Siswa
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-600 dark:border-green-600 dark:text-green-300">
                    {currentGrades.length} Nilai Tersimpan
                  </Badge>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student, index) => {
                const existingGrade = existingGrades.find(
                  grade => grade.assessmentId === selectedAssessment && grade.studentId === student.id
                );
                const isEditing = editingGrades[student.id];

                return (
                  <div key={student.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'}`}>
                    <div className="flex items-center justify-between">
                      {/* Student Info */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {student.name} {student.surname}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300 text-xs">
                                <Users className="mr-1 h-3 w-3" />
                                {student.className}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Grade Input/Display */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={scores[student.id] || ''}
                                onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                className="w-20 text-center"
                                placeholder="0-100"
                              />
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() => handleSave(student.id)}
                                        disabled={!scores[student.id]}
                                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Simpan nilai</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCancel(student.id)}
                                        className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Batal</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {existingGrade ? (
                                <Badge 
                                  variant="outline" 
                                  className={`px-3 py-1 text-base font-semibold ${
                                    existingGrade.score >= 80 
                                      ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/20'
                                      : existingGrade.score >= 70
                                      ? 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-900/20'
                                      : existingGrade.score >= 60
                                      ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-900/20'
                                      : 'border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20'
                                  }`}
                                >
                                  <Trophy className="mr-1 h-3 w-3" />
                                  {existingGrade.score}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400">
                                  <Edit3 className="mr-1 h-3 w-3" />
                                  Belum Dinilai
                                </Badge>
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(student.id)}
                                      className="h-8 w-8 p-0 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {existingGrade ? 'Edit nilai' : 'Input nilai'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {students.length === 0 && (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">Tidak ada siswa ditemukan</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Belum ada siswa yang terdaftar untuk kelas ini</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentTable;