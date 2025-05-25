"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
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
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: data,
  });

  const onSubmit = useCallback(async (formData: SubjectSchema) => {
    try {
      const action = type === "create" ? createSubject : updateSubject;
      const result = await action({ success: false, error: false, message: "" }, formData);

      if (result.success) {
        toast.success(`Subject has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to save subject data. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [type, setOpen, router]);

  // Get teachers from relatedData with default empty array
  const teachers = relatedData?.teachers || [];

  // Get current teacher IDs
  const currentTeacherIds = data?.teachers?.map((t: any) => t.id) || [];

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
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
          <label className="text-xs text-gray-500">Teachers</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teachers")}
            defaultValue={currentTeacherIds}
          >
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option
                  value={teacher.id}
                  key={teacher.id}
                >
                  {teacher.name + " " + teacher.surname}
                </option>
              )
            )}
          </select>
          {errors.teachers?.message && (
            <p className="text-xs text-red-400">
              {errors.teachers.message.toString()}
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

export default SubjectForm;
