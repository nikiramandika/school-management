"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useController } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField"; 
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const LessonForm = ({
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      ...data,
      startTime: data?.startTime
        ? new Date(data.startTime).toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
      endTime: data?.endTime
        ? new Date(data.endTime).toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
      subjectId: data?.subjectId || undefined,
      classId: data?.classId || undefined,
    },
  });

  const onSubmit = useCallback(
    async (formData: LessonSchema) => {
      try {
        const submitData = {
          ...formData,
        };

        const action = type === "create" ? createLesson : updateLesson;
        const result = await action(
          { success: false, error: false, message: "" },
          submitData
        );

        if (result.success) {
          toast.success(
            `Pelajaran telah ${type === "create" ? "dibuat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Gagal menyimpan data pelajaran. Silakan coba lagi."
          );
        }
      } catch (error) {
        console.error("Kesalahan pengiriman formulir:", error);
        toast.error("Terjadi kesalahan yang tidak diharapkan. Silakan coba lagi.");
      }
    },
    [type, setOpen, router]
  );

  const { subjects, classes, teachers } = relatedData || {};

  // Prepare options for SelectField
  const subjectOptions = subjects?.map((subject: { id: number; name: string }) => ({
    value: String(subject.id),
    label: subject.name,
  })) || [];

  const classOptions = classes?.map((class_: { id: number; name: string; grade: { level: number } }) => ({
    value: String(class_.id),
    label: `${class_.grade.level === 1 ? "X" : class_.grade.level === 2 ? "XI" : "XII"} ${class_.name}`,
  })) || [];

  const teacherOptions = teachers?.map((teacher: { id: string; name: string; surname: string }) => ({
    value: teacher.id,
    label: `${teacher.name} ${teacher.surname}`,
  })) || [];

  const dayOptions = [
    { value: "MONDAY", label: "Senin" },
    { value: "TUESDAY", label: "Selasa" },
    { value: "WEDNESDAY", label: "Rabu" },
    { value: "THURSDAY", label: "Kamis" },
    { value: "FRIDAY", label: "Jumat" },
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Pelajaran Baru" : "Memperbarui Pelajaran"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nama Pelajaran"
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

        <div className="flex gap-4 w-full">
        <div className="w-full md:w-1/2">
          <SelectField
            label="Mata Pelajaran"
            name="subjectId"
            control={control}
            options={subjectOptions}
            error={errors?.subjectId}
            placeholder="Pilih Mata Pelajaran"
            isSearchable
            isClearable
            valueAsNumber={true}
          />
        </div>

        <div className="w-full md:w-1/4">
          <SelectField
            label="Kelas"
            name="classId"
            control={control}
            options={classOptions}
            error={errors?.classId}
            placeholder="Pilih Kelas"
            isSearchable
            isClearable
            valueAsNumber={true}
          />
        </div>

        <div className="w-full md:w-1/4">
          <SelectField
            label="Hari"
            name="day"
            control={control}
            options={dayOptions}
            error={errors?.day}
            placeholder="Pilih Hari"
            isSearchable={false}
            isClearable
          />
        </div>
        </div>

        <div className="w-full">
          <SelectField
            label="Guru"
            name="teacherId"
            control={control}
            options={teacherOptions}
            error={errors?.teacherId}
            placeholder="Pilih Guru"
            isSearchable
            isClearable
          />
        </div>

        <div className="flex gap-4 w-full">
          <div className="w-1/2">
            <InputField
              label="Waktu Mulai"
              name="startTime"
              type="time"
              defaultValue={data?.startTime}
              register={register}
              error={errors?.startTime}
            />
          </div>
          <div className="w-1/2">
            <InputField
              label="Waktu Berakhir"
              name="endTime"
              type="time"
              defaultValue={data?.endTime}
              register={register}
              error={errors?.endTime}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white p-2 rounded-md disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : type === "create" ? "Buat" : "Perbarui"}
      </button>
    </form>
  );
};

export default LessonForm;