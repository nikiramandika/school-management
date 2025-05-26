'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { createResult, updateResult } from '@/lib/actions';
import { toast } from 'react-toastify';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle } from 'lucide-react';

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
  const assessmentType = isExamPage ? 'exam' : 'assignment';

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

  // Filter assessments based on role and current user
  const filteredAssessments = role === "admin" 
    ? assessments 
    : assessments.filter(assessment => assessment.teacherId === currentUserId);

  const selectedAssessmentDetails = filteredAssessments.find(
    assessment => assessment.id === selectedAssessment
  );

  return (
    <Card className="p-4">
      <div className="mb-4">
        <Select
          value={selectedAssessment}
          onValueChange={setSelectedAssessment}
          disabled={filteredAssessments.length === 0}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder={
              filteredAssessments.length === 0 
                ? `No ${assessmentType}s available` 
                : `Select ${assessmentType}`
            } />
          </SelectTrigger>
          <SelectContent>
            {filteredAssessments.map((assessment) => (
              <SelectItem key={assessment.id} value={assessment.id}>
                {assessment.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedAssessmentDetails && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{selectedAssessmentDetails.title}</h3>
            {selectedAssessmentDetails.date && (
              <p className="text-sm text-muted-foreground mb-1">
                Date: {format(new Date(selectedAssessmentDetails.date), 'MMMM d, yyyy')}
              </p>
            )}
            {selectedAssessmentDetails.description && (
              <p className="text-sm text-muted-foreground">
                {selectedAssessmentDetails.description}
              </p>
            )}
          </div>
        )}
      </div>

      {filteredAssessments.length > 0 ? (
        !selectedAssessment ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <p className="text-lg font-medium">Please select an {assessmentType} first</p>
              <p className="text-sm">Choose an {assessmentType} from the dropdown above to view and manage grades</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const existingGrade = existingGrades.find(
                    grade => grade.assessmentId === selectedAssessment && grade.studentId === student.id
                  );
                  const isEditing = editingGrades[student.id];

                  return (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">
                        {student.name} {student.surname}
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={scores[student.id] || ''}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            className="w-24"
                          />
                        ) : (
                          existingGrade ? (
                            <span className="px-2 py-1 bg-muted rounded">
                              {existingGrade.score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <Button
                            onClick={() => handleSave(student.id)}
                            disabled={!scores[student.id]}
                          >
                            Save
                          </Button>
                        ) : (
                          <TooltipProvider>
                            <Tooltip defaultOpen={false}>
                              <TooltipTrigger asChild>
                                <div className={!selectedAssessment ? "cursor-not-allowed" : ""}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (!selectedAssessment) {
                                        return;
                                      }
                                      handleEdit(student.id);
                                    }}
                                    disabled={!selectedAssessment}
                                    className="disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm"
                              >
                                {!selectedAssessment ? (
                                  <div className="flex items-center gap-2">
                                    <span>⚠️</span>
                                    <p>Pilih {assessmentType} terlebih dahulu</p>
                                  </div>
                                ) : (
                                  <p>Edit nilai</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No {assessmentType}s available for this class
        </div>
      )}
    </Card>
  );
};

export default StudentTable; 