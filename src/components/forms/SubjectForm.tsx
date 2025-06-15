"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
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
            `Mata Pelajaran telah ${type === "create" ? "dibuat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          // Handle specific error cases
          if (result.message?.includes("Unique constraint failed on the fields: (`name`)")) {
            toast.error("Mata pelajaran dengan nama tersebut sudah ada. Silakan gunakan nama yang berbeda.");
          } else {
            toast.error(
              result.message || "Gagal menyimpan data mata pelajaran. Silakan coba lagi."
            );
          }
        }
      } catch (error) {
        console.error("Kesalahan pengiriman formulir:", error);
        // Check if it's a unique constraint error
        if (error instanceof Error && error.message.includes("Unique constraint failed on the fields: (`name`)")) {
          toast.error("Mata pelajaran dengan nama tersebut sudah ada. Silakan gunakan nama yang berbeda.");
        } else {
          toast.error("Terjadi kesalahan yang tidak diharapkan. Silakan coba lagi.");
        }
      }
    },
    [type, setOpen, router]
  );

  const teachers = relatedData?.teachers || [];

  const teacherOptions = teachers.map(
    (teacher: { id: string; name: string; surname: string }) => ({
      value: teacher.id,
      label: `${teacher.name} ${teacher.surname}`,
    })
  );

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
        
        {/* Teachers Multi-Select using SelectField */}
        <SelectField
          label="Guru"
          name="teachers"
          control={control}
          options={teacherOptions}
          error={errors.teachers}
          placeholder="Pilih guru yang mengajar mata pelajaran ini..."
          isMulti={true}
          isSearchable={true}
          isClearable={true}
        />
      </div>
      
      <button
        className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            {type === "create" ? "Membuat..." : "Memperbarui..."}
          </>
        ) : (
          <>
            {type === "create" ? "Buat" : "Perbarui"}
          </>
        )}
      </button>
    </form>
  );
};

export default SubjectForm;