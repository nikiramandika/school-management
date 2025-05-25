"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  classSchema,
  ClassSchema,
} from "@/lib/formValidationSchemas";
import {
  createClass,
  updateClass,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type FormState = {
  success: boolean;
  error: boolean;
  message: string;
};

const ClassForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: data,
  });

  const onSubmit = useCallback(async (formData: ClassSchema) => {
    try {
      const action = type === "create" ? createClass : updateClass;
      const result = await action({ success: false, error: false, message: "" }, formData);

      if (result.success) {
        toast.success(`Class has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to save class data. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [type, setOpen, router]);

  // Get teachers and grades from relatedData
  const teachers = relatedData?.teachers || [];
  const grades = relatedData?.grades || [];

  // Get the current values
  const currentSupervisorId = data?.supervisorId || data?.supervisor?.id;

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new class" : "Update the class"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Class name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Capacity"
          name="capacity"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Supervisor</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
            defaultValue={currentSupervisorId}
          >
            <option value="">Select a supervisor</option>
            {teachers.map(
              (teacher: { id: string; name: string; surname: string; isSupervisor?: boolean }) => {
                const isDisabled = teacher.isSupervisor && teacher.id !== currentSupervisorId;
                return (
                  <option
                    value={teacher.id}
                    key={teacher.id}
                    disabled={isDisabled}
                  >
                    {teacher.name + " " + teacher.surname}
                    {isDisabled ? " (Already a supervisor)" : ""}
                  </option>
                );
              }
            )}
          </select>
          {errors.supervisorId?.message && (
            <p className="text-xs text-red-400">
              {errors.supervisorId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            <option value="">Select a grade</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option
                value={grade.id}
                key={grade.id}
              >
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md" disabled={isSubmitting}>
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ClassForm;
