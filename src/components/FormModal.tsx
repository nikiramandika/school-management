"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { JSX } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (type: "create" | "update", data?: any) => JSX.Element;
} = {
  teacher: (type, data) => <TeacherForm type={type} data={data} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
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
  const role = user?.publicMetadata?.role as string || "student";
  
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

  const Form = () => {
    if (type === "delete" && id) {
      return (
        <form className="flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
            Delete
          </button>
        </form>
      );
    }

    if ((type === "create" || type === "update") && typeof forms[table] === "function") {
      return forms[table](type, data);
    }

    return <p className="text-center">Form for "{table}" not found!</p>;
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
      >
        <IconComponent />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {type === "create"
                ? `Add New ${table.charAt(0).toUpperCase() + table.slice(1)}`
                : type === "update"
                ? `Update ${table.charAt(0).toUpperCase() + table.slice(1)}`
                : `Delete ${table.charAt(0).toUpperCase() + table.slice(1)}`}
            </h2>
            <Form />
            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormModal;
