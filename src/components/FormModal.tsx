"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteEvent,
  deleteLesson,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  lesson: deleteLesson,
  assignment: deleteSubject,
  result: deleteSubject,
  attendance: deleteSubject,
  event: deleteEvent,
  announcement: deleteSubject,
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
// TODO: OTHER FORMS

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
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
  // TODO OTHER LIST ITEMS
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction] = useActionState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);

    return type === "delete" && id ? (
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={id.toString()} />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <Button variant="destructive" className="w-max self-center text-white">
          Delete
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
        "Form not found!"
      )
    ) : (
      "Form not found!"
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
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
