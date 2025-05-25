"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const ResultForm = ({
  type,
  data,
  setOpen,
  student,
  assessment,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  student: {
    id: string;
    name: string;
    surname: string;
  };
  assessment: {
    id: string;
    title: string;
  };
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isExamPage = pathname.includes('/exam');
  const assessmentType = isExamPage ? 'exam' : 'assignment';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      ...data,
      studentId: student.id,
      [isExamPage ? 'examId' : 'assignmentId']: assessment.id,
    },
  });

  const onSubmit = useCallback(
    async (formData: ResultSchema) => {
      try {
        if (type === "update" && !formData.id) {
          toast.error("Missing result ID. Please try again.");
          return;
        }

        let result;
        if (type === "create") {
          result = await createResult(
            { success: false, error: false, message: "" },
            {
              studentId: formData.studentId,
              score: formData.score,
              examId: formData.examId,
              assignmentId: formData.assignmentId,
            }
          );
        } else {
          result = await updateResult(
            { success: false, error: false, message: "" },
            {
              id: formData.id!,
              studentId: formData.studentId,
              score: formData.score,
              examId: formData.examId,
              assignmentId: formData.assignmentId,
            }
          );
        }

        if (result.success) {
          toast.success(
            `Grade has been ${type === "create" ? "saved" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save grade. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router]
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <h3 className="font-semibold">Student</h3>
        <p className="text-sm text-muted-foreground">
          {student.name} {student.surname}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Assessment</h3>
        <p className="text-sm text-muted-foreground">{assessment.title}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Score</label>
        <Input
          type="number"
          min="0"
          max="100"
          {...register("score", { valueAsNumber: true })}
          defaultValue={data?.score}
          className="w-24"
        />
        {errors.score?.message && (
          <p className="text-xs text-red-500">{errors.score.message}</p>
        )}
      </div>

      {data && (
        <input
          type="hidden"
          {...register("id")}
          defaultValue={data.id}
        />
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {type === "create" ? "Save" : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default ResultForm;
