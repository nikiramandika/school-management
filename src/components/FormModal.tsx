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
import { Plus, Pencil, Trash2, X, FileWarning } from "lucide-react";
import { ReactElement } from "react";
import { useUser } from "@clerk/nextjs";
import { HiTrash } from "react-icons/hi";

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
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <h1>Loading...</h1>,
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
    }, 300); // Match animation duration
  };

  const handleDelete = useCallback(async () => {
    if (!id) return;
    if (!confirmDelete) {
      toast.error(
        "Silakan konfirmasi bahwa Anda memahami konsekuensi dari penghapusan ini"
      );
      return;
    }
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
    }
  }, [table, id, router, confirmDelete, userId, userRole, username]);

  const Form = () => {
    return type === "delete" && id ? (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleDelete();
        }}
        className="flex flex-col gap-4"
      >
        <span className="text-lg text-left font-medium flex justify-start items-center gap-2 text-destructive dark:text-destructive">
          <HiTrash></HiTrash> Hapus {tableNameMap[table] || table} ini?
        </span>
        <span>
          Semua data yang terkait {tableNameMap[table] || table} akan dihapus
          secara permanen. Apakah Anda yakin ingin melanjutkan?
        </span>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.checked)}
            className="h-6 w-6 rounded-xl border-gray-300 accent-teal-600 focus:ring-teal-600 focus:ring-0 cursor-pointer" // teal-500
          />
          <label htmlFor="confirmDelete" className="text-sm text-gray-600 pl-2">
            "Saya menyadari bahwa penghapusan {tableNameMap[table] || table} ini
            bersifat permanen dan tidak dapat dipulihkan."
          </label>
        </div>
        <Button
          variant="destructive"
          type="submit"
          className="w-max self-end text-white"
          disabled={!confirmDelete}
        >
          Hapus
        </Button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table] ? (
        (() => {
          console.log("FormModal Data:", {
            type,
            data,
            relatedData,
            table,
          });
          return forms[table](setOpen, type, data, relatedData);
        })()
      ) : (
        "Form tidak ditemukan!"
      )
    ) : (
      "Form tidak ditemukan!"
    );
  };

  const getIcon = () => {
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

  return (
    <>
      <Button
        variant={
          type === "create"
            ? "outline"
            : type === "update"
            ? "secondary"
            : "destructive"
        }
        size="icon"
        onClick={() => setOpen(true)}
      >
        {getIcon()}
      </Button>
      {open && (
        <div
          className={`fixed inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center transition-all duration-300 ${
            isClosing ? "opacity-0" : "opacity-100 animate-in fade-in-0"
          }`}
          onClick={handleClose}
        >
          <div
            className={`soft-light bg-white dark:bg-[#282a30] p-8 rounded-xl shadow-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] transition-all duration-300 ease-out text-left ${
              isClosing
                ? "opacity-0 translate-x-8 -translate-y-8 scale-95"
                : "opacity-100 translate-x-0 translate-y-0 scale-100 animate-in slide-in-from-top-2 slide-in-from-right-8 fade-in-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Form />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
