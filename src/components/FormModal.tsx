"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useState,
  type Dispatch,
  type JSX,
  type SetStateAction,
} from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { useFormState } from "react-dom";
import { deleteSubject } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Pemetaan delete action
const deleteActionMap = {
  subject: deleteSubject,
  class: deleteSubject,
  teacher: deleteSubject,
  student: deleteSubject,
  exam: deleteSubject,
  lesson: deleteSubject,
  assignment: deleteSubject,
  result: deleteSubject,
  attendance: deleteSubject,
  event: deleteSubject,
  announcement: deleteSubject,
};

// Load form secara dinamis
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});

// Pemetaan nama form ke komponen
const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any
  ) => JSX.Element;
} = {
  teacher: (setOpen, type, data) => (
    <TeacherForm type={type} data={data} setOpen={setOpen} />
  ),
  student: (setOpen, type, data) => (
    <StudentForm type={type} data={data} setOpen={setOpen} />
  ),
  subject: (setOpen, type, data) => (
    <SubjectForm type={type} data={data} setOpen={setOpen} />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
}: {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
}) => {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "student";

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const iconSize = 16;

  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const IconComponent = () => {
    switch (type) {
      case "create":
        return <FiPlus size={iconSize} className="text-black" />;
      case "update":
        return <FiEdit size={iconSize} className="text-white" />;
      case "delete":
        return <FiTrash2 size={iconSize} className="text-white" />;
      default:
        return null;
    }
  };

  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(deleteActionMap[table], {
    success: false,
    error: false,
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `${table.charAt(0).toUpperCase() + table.slice(1)} has been deleted!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state]);

  const Form = () => {
    if (type === "delete" && id) {
      return (
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={id.toString()} />
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <button
            type="submit"
            className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center"
          >
            Delete
          </button>
        </form>
      );
    }

    if (
      (type === "create" || type === "update") &&
      typeof forms[table] === "function"
    ) {
      return forms[table](setOpen, type, data);
    }

    return <p className="text-center">Form for "{table}" not found!</p>;
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full cursor-pointer ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <IconComponent />
      </button>

      {open && (
        <div className="fixed inset-0 bg-gray-900/60 z-60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <span className="text-gray-600 hover:text-black text-lg">×</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
