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
} from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { ReactElement } from "react";
import { useUser } from "@clerk/nextjs";

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
  announcement: "Pengumuman"
};

// USE LAZY LOADING

// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

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


// TODO: OTHER FORMS

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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const userRole = user?.publicMetadata?.role;
  const username = typeof user?.username === "string"
    ? user.username
    : typeof user?.emailAddresses?.[0]?.emailAddress === "string"
      ? user.emailAddresses[0].emailAddress
      : typeof user?.id === "string"
        ? user.id
        : "";

  const handleDelete = useCallback(async () => {
    if (!id) return;
    if (!confirmDelete) {
      toast.error("Silakan konfirmasi bahwa Anda memahami konsekuensi dari penghapusan ini");
      return;
    }
    try {
      const action = deleteActionMap[table];
      const formData = new FormData();
      formData.append("id", id.toString());
      formData.append("confirmDelete", "true");
      formData.append("userId", ((userRole === "admin" ? username : userId) ?? "").toString());
      formData.append("userRole", (userRole ?? "").toString());
      const result = await action({ success: false, error: false, message: "" }, formData);
      if (result.success) {
        toast.success(`${tableNameMap[table] || table} berhasil dihapus!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || `Gagal menghapus ${tableNameMap[table] || table}. Silakan coba lagi.`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
    }
  }, [table, id, router, confirmDelete, userId, userRole, username]);

  const Form = () => {
    return type === "delete" && id ? (
      <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }} className="flex flex-col gap-4">
        <span className="text-center font-medium">
          Semua data akan hilang. Apakah Anda yakin ingin menghapus {tableNameMap[table] || table} ini?
        </span>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="confirmDelete" className="text-sm text-gray-600">
            Saya mengerti bahwa menghapus {tableNameMap[table] || table} ini akan menghapus semua data terkait dan tidak dapat dibatalkan
          </label>
        </div>
        <Button 
          variant="destructive" 
          type="submit" 
          className="w-max self-center text-white"
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
            table
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
        <div className="fixed inset-0 bg-white/75 dark:bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center   ">
          <div className="soft-light bg-softlight dark:bg-softdark  p-8 rounded-xl shadow-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-4"
              onClick={() => setOpen(false)}
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
