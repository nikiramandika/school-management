"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
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
    },
  });

  const onSubmit = useCallback(
    async (formData: LessonSchema) => {
      try {
        const submitData = {
          ...formData,
          subjectId: Number(formData.subjectId),
          classId: Number(formData.classId),
        };

        const action = type === "create" ? createLesson : updateLesson;
        const result = await action(
          { success: false, error: false, message: "" },
          submitData
        );

        if (result.success) {
          toast.success(
            `Lesson has been ${type === "create" ? "created" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save lesson data. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router]
  );

  const { subjects, classes, teachers } = relatedData || {};

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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Mata Pelajaran</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId", { valueAsNumber: true })}
            defaultValue={data?.subjectId}
          >
            <option value="">Pilih Mata Pelajaran</option>
            {subjects?.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Kelas</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", { valueAsNumber: true })}
            defaultValue={data?.classId}
          >
            <option value="">Pilih Kelas</option>
            {classes?.map((class_: { id: number; name: string }) => (
              <option value={class_.id} key={class_.id}>
                {class_.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Hari</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("day")}
            defaultValue={data?.day}
          >
            <option value="">Pilih Hari</option>
            <option value="MONDAY">Senin</option>
            <option value="TUESDAY">Selasa</option>
            <option value="WEDNESDAY">Rabu</option>
            <option value="THURSDAY">Kamis</option>
            <option value="FRIDAY">Jumat</option>
          </select>
          {errors.day?.message && (
            <p className="text-xs text-red-400">
              {errors.day.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Guru</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
            defaultValue={data?.teacherId}
          >
            <option value="">Pilih Guru</option>
            {teachers?.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option value={teacher.id} key={teacher.id}>
                  {teacher.name} {teacher.surname}
                </option>
              )
            )}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">
              {errors.teacherId.message.toString()}
            </p>
          )}
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
