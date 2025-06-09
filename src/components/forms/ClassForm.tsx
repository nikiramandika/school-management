"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import InputField from "../InputField";
import { classSchema, ClassSchema as ClassSchemaBase } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type FormState = {
  success: boolean;
  error: boolean;
  message: string;
};

// Helper untuk mapping level ke label
function getTingkatLabel(level: number) {
  if (level === 1) return "X";
  if (level === 2) return "XI";
  if (level === 3) return "XII";
  return level;
}

// Override agar academicYear dan isActive selalu required
type ClassSchema = Omit<ClassSchemaBase, "academicYear" | "isActive"> & {
  academicYear: string;
  isActive: boolean;
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
  console.log("data.isActive:", data?.isActive, typeof data?.isActive);
  if (typeof data?.isActive !== 'boolean') {
    console.warn('PERINGATAN: data.isActive tidak ditemukan atau bukan boolean! Nilai:', data?.isActive, typeof data?.isActive);
  }
  // Get teachers and grades from relatedData
  const teachers = relatedData?.teachers || [];
  const grades = relatedData?.grades || [];
  // Get the current values
  const currentSupervisorId = data?.supervisorId || data?.supervisor?.id || "";

  // Generate academic years (from 2020 to 2030)
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i;
    return `${year}/${year + 1}`;
  });

  // Default values sesuai schema
  const defaultValues: ClassSchema = {
    id: data?.id,
    name: data?.name ?? "",
    capacity: data?.capacity ?? 1,
    gradeId: data?.gradeId ?? (grades[0]?.id ?? 1),
    supervisorId: data?.supervisorId ?? "",
    academicYear: data?.academicYear ?? `${currentYear}/${currentYear + 1}`,
    isActive: typeof data?.isActive === "boolean" ? data.isActive : true,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues,
  });

  // SUBMIT
  const onSubmit: SubmitHandler<ClassSchema> = async (formData) => {
    try {
      const action = type === "create" ? createClass : updateClass;
      const result = await action(
        { success: false, error: false, message: "" },
        formData
      );
      if (result.success) {
        toast.success(
          `Class has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(
          result.message || "Failed to save class data. Please try again."
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Kelas Baru" : "Memperbarui Kelas"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nama Kelas"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Kapasitas"
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
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Wali Kelas</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
            defaultValue={currentSupervisorId}
          >
            <option value="">Pilih Wali Kelas</option>
            {teachers.map(
              (teacher: {
                id: string;
                name: string;
                surname: string;
                isSupervisor?: boolean;
              }) => {
                const isDisabled =
                  teacher.isSupervisor && teacher.id !== currentSupervisorId;
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
          <label className="text-xs text-gray-500">Tingkat</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            <option value="">Pilih Tingkatan</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Tahun Ajaran</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("academicYear")}
            defaultValue={data?.academicYear}
          >
            {academicYears.map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.academicYear?.message && (
            <p className="text-xs text-red-400">
              {errors.academicYear.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Aktif?</label>
          <input
            type="checkbox"
            className="w-5 h-5 mt-2"
            {...register("isActive")}
          />
        </div>
      </div>
      <button
        className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white p-2 rounded-md"
        disabled={isSubmitting}
      >
        {type === "create" ? "Buat" : "Perbarui"}
      </button>
    </form>
  );
};

export default ClassForm;
