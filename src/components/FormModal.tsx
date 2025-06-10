"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteEvent,
  deleteLesson,
  deleteAssignment,
  deleteResult,
  deleteAnnouncement,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { ReactElement } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteSubject,
  event: deleteEvent,
  announcement: deleteAnnouncement,
};

const tableNameMap: { [key: string]: string } = {
  subject: "Mata Pelajaran",
  class: "Kelas",
  teacher: "Guru",
  student: "Siswa",
  exam: "Ujian",
  lesson: "Pelajaran",
  assignment: "Tugas",
  result: "Hasil",
  attendance: "Kehadiran",
  event: "Acara",
  announcement: "Pengumuman",
};

// USE LAZY LOADING
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
        <span className="text-gray-600 dark:text-gray-400">
          Memuat formulir...
        </span>
      </div>
    </div>
  ),
});

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => ReactElement;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      student={relatedData.student}
      assessment={relatedData.assessment}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const userRole = user?.publicMetadata?.role;
  const username =
    typeof user?.username === "string"
      ? user.username
      : typeof user?.emailAddresses?.[0]?.emailAddress === "string"
      ? user.emailAddresses[0].emailAddress
      : typeof user?.id === "string"
      ? user.id
      : "";

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      setConfirmDelete(false);
    }, 300); // Match animation duration from old version
  };

  const handleDelete = useCallback(async () => {
    if (!id || !confirmDelete) {
      toast.error(
        "Silakan konfirmasi bahwa Anda memahami konsekuensi dari penghapusan ini"
      );
      return;
    }

    setIsDeleting(true);
    try {
      const action = deleteActionMap[table];
      const formData = new FormData();
      formData.append("id", id.toString());
      formData.append("confirmDelete", "true");
      formData.append(
        "userId",
        ((userRole === "admin" ? username : userId) ?? "").toString()
      );
      formData.append("userRole", (userRole ?? "").toString());

      const result = await action(
        { success: false, error: false, message: "" },
        formData
      );

      if (result.success) {
        toast.success(`${tableNameMap[table] || table} berhasil dihapus!`);
        handleClose();
        router.refresh();
      } else {
        toast.error(
          result.message ||
            `Gagal menghapus ${
              tableNameMap[table] || table
            }. Silakan coba lagi.`
        );
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  }, [table, id, router, confirmDelete, userId, userRole, username]);

  const getModalTitle = () => {
    const entityName = tableNameMap[table] || table;
    switch (type) {
      case "create":
        return `Tambah ${entityName} Baru`;
      case "update":
        return `Edit ${entityName}`;
      case "delete":
        return `Hapus ${entityName}`;
      default:
        return entityName;
    }
  };

  const getModalIcon = () => {
    switch (type) {
      case "create":
        return <Plus className="h-5 w-5 text-cyan-600" />;
      case "update":
        return <Pencil className="h-5 w-5 text-blue-600" />;
      case "delete":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const DeleteForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h4 className="font-medium text-red-900 dark:text-red-200">
            Peringatan Penghapusan Permanen
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
            terkait.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Data yang akan dihapus:
          </h3>
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {tableNameMap[table] || table} dan semua data yang terkait
              dengannya
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirmDelete"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label
              htmlFor="confirmDelete"
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
            >
              Saya memahami bahwa penghapusan{" "}
              <strong>{tableNameMap[table] || table}</strong> ini bersifat
              permanen dan tidak dapat dipulihkan. Semua data terkait akan
              hilang selamanya.
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isDeleting}
          className="min-w-[100px]"
        >
          Batal
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={!confirmDelete || isDeleting}
          className="min-w-[100px] bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menghapus...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Permanen
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const Form = () => {
    if (type === "delete" && id) {
      return <DeleteForm />;
    } else if (type === "create" || type === "update") {
      if (forms[table]) {
        console.log("FormModal Data:", {
          type,
          data,
          relatedData,
          table,
        });
        return forms[table](setOpen, type, data, relatedData);
      } else {
        return (
          <div className="text-center py-8">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-fit mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Form tidak ditemukan untuk {table}
            </p>
          </div>
        );
      }
    } else {
      return (
        <div className="text-center py-8">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Tipe form tidak valid
          </p>
        </div>
      );
    }
  };

  const getButtonIcon = () => {
    switch (type) {
      case "create":
        return <Plus className="h-4 w-4" />;
      case "update":
        return <Pencil className="h-4 w-4" />;
      case "delete":
        return <Trash2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case "create":
        return "default" as const;
      case "update":
        return "secondary" as const;
      case "delete":
        return "outline" as const;
      default:
        return "default" as const;
    }
  };

  const getButtonClassName = () => {
    switch (type) {
      case "create":
        return "bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-600";
      case "update":
        return "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "delete":
        return "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20";
      default:
        return "";
    }
  };

  return (
    <>
      <Button
        variant={getButtonVariant()}
        size="icon"
        onClick={() => setOpen(true)}
        className={getButtonClassName()}
      >
        {getButtonIcon()}
      </Button>

      {open && (
        <div
          className={`fixed inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center transition-all duration-300 ${
            isClosing ? "opacity-0" : "opacity-100 animate-in fade-in-0"
          }`}
          onClick={handleClose}
        >
          <Card
            className={`soft-light bg-white dark:bg-[#282a30] w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-auto shadow-md border-0 transition-all duration-300 ease-out text-left ${
              isClosing
                ? "opacity-0 translate-x-8 -translate-y-8 scale-95"
                : "opacity-100 translate-x-0 translate-y-0 scale-100 animate-in slide-in-from-top-2 slide-in-from-right-8 fade-in-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-card rounded-lg">
                    {getModalIcon()}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getModalTitle()}
                    </CardTitle>
                    {type !== "delete" && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {type === "create"
                          ? "Isi formulir di bawah ini"
                          : "Ubah informasi yang diperlukan"}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <Form />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default FormModal;
