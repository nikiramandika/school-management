"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Select from "react-select";

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
    control,
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      ...data,
      teachers: data?.teachers?.map((t: any) => t.id) || [],
    },
  });

  const onSubmit = useCallback(
    async (formData: SubjectSchema) => {
      try {
        const action = type === "create" ? createSubject : updateSubject;
        const result = await action(
          { success: false, error: false, message: "" },
          formData
        );

        if (result.success) {
          toast.success(
            `Subject has been ${type === "create" ? "created" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save subject data. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router]
  );

  // Get teachers from relatedData with default empty array
  const teachers = relatedData?.teachers || [];

  // Get current teacher IDs
  const currentTeacherIds = data?.teachers?.map((t: any) => t.id) || [];

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Membuat Mata Pelajaran Baru"
          : "Memperbarui Mata Pelajaran"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nama Mata Pelajaran"
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
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Guru</label>
          <Controller
            control={control}
            name="teachers"
            render={({ field }) => {
              const selectedIds = field.value || [];
              const selectedOptions = selectedIds.map((id: string) => {
                const teacher = teachers.find(
                  (t: { id: string }) => t.id === id
                );
                return teacher
                  ? {
                      value: teacher.id,
                      label: teacher.name + " " + teacher.surname,
                    }
                  : { value: id, label: id };
              });
              const mergedOptions = [
                ...teachers.map(
                  (teacher: { id: string; name: string; surname: string }) => ({
                    value: teacher.id,
                    label: teacher.name + " " + teacher.surname,
                  })
                ),
                ...selectedOptions,
              ];
              // Hilangkan duplikat berdasarkan value
              const uniqueOptions = Array.from(
                new Map(mergedOptions.map((opt) => [opt.value, opt])).values()
              );
              return (
                <Select
                  isMulti
                  isSearchable
                  options={uniqueOptions}
                  value={selectedOptions}
                  onChange={(selected) =>
                    field.onChange(
                      selected ? selected.map((s: any) => s.value) : []
                    )
                  }
                  classNamePrefix="react-select"
                  placeholder="Select teachers..."
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              );
            }}
          />
          {errors.teachers?.message && (
            <p className="text-xs text-red-400 ">
              {errors.teachers.message.toString()}
            </p>
          )}
        </div>
      </div>
      <button
        className="bg-cyan-500 text-white p-2 rounded-md"
        disabled={isSubmitting}
      >
        {type === "create" ? "Buat" : "Perbarui"}
      </button>
    </form>
  );
};

export default SubjectForm;
