"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Pencil,
  Save,
  AlertCircle,
  User,
  Calendar,
  BookOpen,
  UserCheck,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  History,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { toast } from "react-toastify";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    supervisorId: string | null;
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
  student?: {
    id: string;
    name: string;
    surname: string;
  };
}

interface AttendanceTableProps {
  students: Student[];
  lessons: Lesson[];
  role?: string;
  currentUserId?: string;
  existingAttendances: Attendance[];
}

interface AttendanceHistory {
  date: string;
  lessonId: number;
  lessonName: string;
  teacherName: string;
  className: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendances: Attendance[];
}

export function AttendanceTable({
  students,
  lessons,
  role,
  currentUserId,
  existingAttendances,
}: AttendanceTableProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, boolean>
  >({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AttendanceHistory | null>(null);

  // Initialize attendance status from existing records when lesson and date are selected
  useEffect(() => {
    if (selectedLesson && selectedDate) {
      const initialStatus: Record<string, boolean> = {};
      existingAttendances
        .filter(
          (attendance) =>
            attendance.lessonId === parseInt(selectedLesson) &&
            format(new Date(attendance.date), "yyyy-MM-dd") === selectedDate
        )
        .forEach((attendance) => {
          initialStatus[attendance.studentId] = attendance.present;
        });
      setAttendanceStatus(initialStatus);
      setIsEditing(false);
      setHasChanges(false);
    }
  }, [selectedLesson, selectedDate, existingAttendances]);

  const handleAttendanceChange = (studentId: string, value: boolean) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: value,
    }));
    setHasChanges(true);
  };

  const handleSelectAll = (checked: boolean) => {
    const newStatus: Record<string, boolean> = {};
    students.forEach((student) => {
      newStatus[student.id] = checked;
    });
    setAttendanceStatus(newStatus);
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (!selectedLesson) {
      toast.error("Please select a lesson first");
      return;
    }

    try {
      const savePromises = Object.entries(attendanceStatus).map(
        async ([studentId, present]) => {
          const existingAttendance = existingAttendances.find(
            (attendance) =>
              attendance.lessonId === parseInt(selectedLesson) &&
              attendance.studentId === studentId &&
              format(new Date(attendance.date), "yyyy-MM-dd") === selectedDate
          );

          const formData = {
            studentId,
            present,
            date: new Date(selectedDate),
            id: existingAttendance ? existingAttendance.id : 0,
            lessonId: parseInt(selectedLesson),
          };

          return existingAttendance
            ? updateAttendance(
                { success: false, error: false, message: "" },
                formData
              )
            : createAttendance(
                { success: false, error: false, message: "" },
                formData
              );
        }
      );

      const results = await Promise.all(savePromises);
      const allSuccessful = results.every((result) => result.success);

      if (allSuccessful) {
        toast.success("Attendance saved successfully");
        setIsEditing(false);
        setHasChanges(false);
        router.refresh();
      } else {
        toast.error("Some attendance records failed to save");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance. Please try again.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Filter lessons based on role and current user
  const filteredLessons =
    role === "admin"
      ? lessons
      : lessons.filter(
          (lesson) =>
            lesson.teacher.id === currentUserId ||
            lesson.class.supervisorId === currentUserId
        );

  const selectedLessonDetails = filteredLessons.find(
    (lesson) => lesson.id.toString() === selectedLesson
  );

  // Check if all students are present
  const allPresent =
    students.length > 0 &&
    students.every((student) => attendanceStatus[student.id]);

  // Generate attendance history
  const generateAttendanceHistory = (): AttendanceHistory[] => {
    const historyMap = new Map<string, AttendanceHistory>();

    existingAttendances.forEach((attendance) => {
      const dateKey = format(new Date(attendance.date), "yyyy-MM-dd");
      const historyKey = `${dateKey}-${attendance.lessonId}`;
      
      const lesson = lessons.find(l => l.id === attendance.lessonId);
      if (!lesson) return;

      if (!historyMap.has(historyKey)) {
        historyMap.set(historyKey, {
          date: dateKey,
          lessonId: attendance.lessonId,
          lessonName: lesson.name,
          teacherName: `${lesson.teacher.name} ${lesson.teacher.surname}`,
          className: lesson.class.name,
          totalStudents: 0,
          presentStudents: 0,
          absentStudents: 0,
          attendances: [],
        });
      }

      const historyItem = historyMap.get(historyKey)!;
      historyItem.attendances.push(attendance);
      historyItem.totalStudents++;
      
      if (attendance.present) {
        historyItem.presentStudents++;
      } else {
        historyItem.absentStudents++;
      }
    });

    return Array.from(historyMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const attendanceHistory = generateAttendanceHistory();

  // Filter history based on selected lesson if any
  const filteredHistory = selectedLesson 
    ? attendanceHistory.filter(h => h.lessonId === parseInt(selectedLesson))
    : attendanceHistory;

  return (
    <div className="space-y-6">
      {/* Attendance History Section */}
      {attendanceHistory.length > 0 && (
        <Card className="overflow-hidden">
          <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <CollapsibleTrigger asChild>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-b border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <History className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Riwayat Absensi
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredHistory.length} riwayat absensi tersimpan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-700 dark:text-green-300">
                      {filteredHistory.length} Riwayat
                    </Badge>
                    {isHistoryOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="max-h-96 overflow-y-auto">
                {filteredHistory.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredHistory.map((historyItem, index) => (
                      <div key={`${historyItem.date}-${historyItem.lessonId}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {historyItem.lessonName}
                                </span>
                                <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300 text-xs">
                                  {historyItem.className}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(historyItem.date), "dd MMM yyyy")}
                                </div>
                                <div className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />
                                  {historyItem.teacherName}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex gap-2 mb-1">
                                <Badge variant="outline" className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300 text-xs">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  {historyItem.presentStudents} Hadir
                                </Badge>
                                <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-700 dark:text-red-300 text-xs">
                                  <XCircle className="mr-1 h-3 w-3" />
                                  {historyItem.absentStudents} Absen
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Total: {historyItem.totalStudents} siswa
                              </p>
                            </div>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedHistoryItem(selectedHistoryItem?.date === historyItem.date && selectedHistoryItem?.lessonId === historyItem.lessonId ? null : historyItem);
                                    }}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Detail
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Lihat detail absensi</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* Detail Attendance for Selected History Item */}
                        {selectedHistoryItem?.date === historyItem.date && selectedHistoryItem?.lessonId === historyItem.lessonId && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Detail Kehadiran Siswa
                            </h4>
                            <div className="grid gap-2 max-h-32 overflow-y-auto">
                              {historyItem.attendances.map((attendance) => {
                                const student = students.find(s => s.id === attendance.studentId);
                                const studentName = student ? `${student.name} ${student.surname}` : 
                                  attendance.student ? `${attendance.student.name} ${attendance.student.surname}` : 
                                  'Unknown Student';
                                
                                return (
                                  <div key={attendance.id} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {studentName}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        attendance.present
                                          ? "border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300"
                                          : "border-red-200 text-red-700 dark:border-red-700 dark:text-red-300"
                                      }`}
                                    >
                                      {attendance.present ? (
                                        <>
                                          <CheckCircle className="mr-1 h-2 w-2" />
                                          Hadir
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="mr-1 h-2 w-2" />
                                          Absen
                                        </>
                                      )}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <History className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedLesson ? "Belum ada riwayat absensi untuk pelajaran ini" : "Belum ada riwayat absensi"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Header Controls */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manajemen Absensi
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <Select
                value={selectedLesson}
                onValueChange={setSelectedLesson}
                disabled={filteredLessons.length === 0}
              >
                <SelectTrigger className="w-[280px] border-blue-200 focus:border-blue-400">
                  <SelectValue
                    placeholder={
                      filteredLessons.length === 0
                        ? "Tidak ada pelajaran yang tersedia"
                        : "Pilih Pelajaran"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredLessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id.toString()}>
                      <div className="flex items-center gap-2">
                        {lesson.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-indigo-200 rounded-md focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {selectedLesson && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleEdit}
                          variant="outline"
                          className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/20"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Kehadiran
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit kehadiran siswa</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleSaveAll}
                          disabled={!hasChanges}
                          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Save className="h-4 w-4" />
                          Simpan Semua
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Simpan semua perubahan kehadiran
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>

          {selectedLessonDetails && (
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                  >
                    <BookOpen className="mr-1 h-3 w-3" />
                    {selectedLessonDetails.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                  >
                    <Users className="mr-1 h-3 w-3" />
                    {selectedLessonDetails.class.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300"
                  >
                    <UserCheck className="mr-1 h-3 w-3" />
                    {selectedLessonDetails.teacher.name}{" "}
                    {selectedLessonDetails.teacher.surname}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Main Content */}
      <Card className="overflow-hidden">
        {!selectedLesson ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Silakan pilih pelajaran terlebih dahulu
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pilih pelajaran dari menu dropdown di atas untuk melihat dan
                  mengelola absensi
                </p>
              </div>
            </div>
          </div>
        ) : filteredLessons.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Daftar Kehadiran Siswa
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300"
                  >
                    {students.length} Siswa
                  </Badge>
                </div>
                {isEditing && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Pilih Semua:
                    </span>
                    <Checkbox
                      checked={allPresent}
                      onCheckedChange={(checked) =>
                        handleSelectAll(checked as boolean)
                      }
                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Table Content */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student, index) => {
                const existingAttendance = existingAttendances.find(
                  (attendance) =>
                    attendance.lessonId === parseInt(selectedLesson) &&
                    attendance.studentId === student.id &&
                    format(new Date(attendance.date), "yyyy-MM-dd") ===
                      selectedDate
                );

                const isPresent = attendanceStatus[student.id] || false;

                return (
                  <div
                    key={student.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      index % 2 === 0
                        ? "bg-white dark:bg-card"
                        : "bg-gray-50/50 dark:bg-gray-800/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Student Info */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {student.name} {student.surname}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300 text-xs"
                              >
                                <Users className="mr-1 h-3 w-3" />
                                {student.class.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Attendance Status */}
                      <div className="flex items-center gap-4">
                        {isEditing ? (
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isPresent}
                              onCheckedChange={(checked) =>
                                handleAttendanceChange(
                                  student.id,
                                  checked as boolean
                                )
                              }
                              className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                            />
                            <Badge
                              variant="outline"
                              className={`${
                                isPresent
                                  ? "border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300"
                                  : "border-red-200 text-red-700 dark:border-red-700 dark:text-red-300"
                              }`}
                            >
                              {isPresent ? (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Hadir
                                </>
                              ) : (
                                <>
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Absen
                                </>
                              )}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {existingAttendance ? (
                              <Badge
                                variant="outline"
                                className={`${
                                  existingAttendance.present
                                    ? "border-teal-200 text-teal-700 bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:bg-teal-900/20"
                                    : "border-red-200 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/20"
                                }`}
                              >
                                {existingAttendance.present ? (
                                  <>
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Hadir
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Absen
                                  </>
                                )}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400"
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                Belum Dicatat
                              </Badge>
                            )}
                          </div>
                        )}
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
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Tidak ada siswa ditemukan
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Belum ada siswa yang terdaftar untuk kelas ini
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Tidak ada pelajaran tersedia
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tidak ada pelajaran yang tersedia untuk kelas ini
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
