"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ResultForm = ({
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
  const [assessmentType, setAssessmentType] = useState(
    data?.examId ? "exam" : "assignment"
  );

  // Get students from relatedData
  const students = relatedData?.students || [];
  // Get exams from relatedData
  const exams = relatedData?.exams || [];
  // Get assignments from relatedData
  const assignments = relatedData?.assignments || [];
  // Get classes from relatedData
  const classes = relatedData?.classes || [];

  // Set initial class based on data
  const initialClass = data ? (
    data.examId 
      ? exams.find((exam: any) => exam.id === data.examId.toString())?.className
      : assignments.find((assignment: any) => assignment.id === data.assignmentId.toString())?.className
  ) : "";

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: data,
  });

  const onSubmit = useCallback(
    async (formData: ResultSchema) => {
      try {
        const action = type === "create" ? createResult : updateResult;
        const result = await action(
          { success: false, error: false, message: "" },
          formData
        );

        if (result.success) {
          toast.success(
            `Result has been ${type === "create" ? "created" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save result data. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router]
  );

  const handleAssessmentTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setAssessmentType(value);
    // Clear the other field when switching types
    if (value === "exam") {
      setValue("assignmentId", undefined);
    } else {
      setValue("examId", undefined);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClass(value);
    // Clear student selection when class changes
    setValue("studentId", "");
  };

  // Filter students based on selected class
  const filteredStudents = selectedClass
    ? students.filter((student: any) => student.className === selectedClass)
    : students;

  // Filter exams and assignments based on selected class
  const filteredExams = selectedClass
    ? exams.filter((exam: any) => exam.className === selectedClass)
    : exams;

  const filteredAssignments = selectedClass
    ? assignments.filter((assignment: any) => assignment.className === selectedClass)
    : assignments;

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            onChange={handleClassChange}
            value={selectedClass}
          >
            <option value="">Select a class</option>
            {classes.map((cls: { id: string; name: string }) => (
              <option value={cls.name} key={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
            defaultValue={data?.studentId}
            disabled={!selectedClass}
          >
            <option value="">Select a student</option>
            {filteredStudents.map(
              (student: { id: string; name: string; surname: string }) => (
                <option value={student.id} key={student.id}>
                  {student.name} {student.surname}
                </option>
              )
            )}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Assessment Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            onChange={handleAssessmentTypeChange}
            value={assessmentType}
            disabled={!selectedClass}
          >
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>

        {assessmentType === "exam" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Exam</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("examId", { valueAsNumber: true })}
              defaultValue={data?.examId}
              disabled={!selectedClass}
            >
              <option value="">Select an exam</option>
              {filteredExams.map((exam: { id: string; title: string }) => (
                <option value={parseInt(exam.id)} key={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            {errors.examId?.message && (
              <p className="text-xs text-red-400">
                {errors.examId.message.toString()}
              </p>
            )}
          </div>
        )}

        {assessmentType === "assignment" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Assignment</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("assignmentId", { valueAsNumber: true })}
              defaultValue={data?.assignmentId}
              disabled={!selectedClass}
            >
              <option value="">Select an assignment</option>
              {filteredAssignments.map((assignment: { id: string; title: string }) => (
                <option value={parseInt(assignment.id)} key={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
            {errors.assignmentId?.message && (
              <p className="text-xs text-red-400">
                {errors.assignmentId.message.toString()}
              </p>
            )}
          </div>
        )}

        <InputField
          label="Score"
          name="score"
          defaultValue={data?.score}
          register={register}
          error={errors?.score}
          type="number"
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

export default ResultForm;
