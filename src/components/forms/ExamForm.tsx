"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamForm = ({
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
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      ...data,
      startTime: data?.startTime ? new Date(data.startTime).toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).slice(0, 16) : undefined,
      endTime: data?.endTime ? new Date(data.endTime).toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).slice(0, 16) : undefined,
    },
  });

  const onSubmit = useCallback(
    async (formData: ExamSchema) => {
      try {
        const action = type === "create" ? createExam : updateExam;
        const result = await action(
          { success: false, error: false, message: "" },
          formData
        );

        if (result.success) {
          toast.success(
            `Exam has been ${type === "create" ? "created" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save exam data. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router]
  );

  // Get lessons from relatedData
  const lessons = relatedData?.lessons || [];

  // Get current lesson ID
  const currentLessonId = data?.lessonId || data?.lesson?.id;

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Start Date"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="End Date"
          name="endTime"
          defaultValue={data?.endTime}
          register={register}
          error={errors?.endTime}
          type="datetime-local"
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
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={currentLessonId}
          >
            <option value="">Select a lesson</option>
            {lessons.map(
              (lesson: {
                id: number;
                name: string;
                subject: { id: number; name: string };
                class: { id: number; name: string };
                teacher: { id: string; name: string; surname: string };
              }) => (
                <option value={lesson.id} key={lesson.id}>
                  {lesson.subject.name} - {lesson.class.name} ({lesson.name}) -{" "}
                  {lesson.teacher.name} {lesson.teacher.surname}
                </option>
              )
            )}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
      </div>
      <button
        className="bg-blue-400 text-white p-2 rounded-md"
        disabled={isSubmitting}
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;
