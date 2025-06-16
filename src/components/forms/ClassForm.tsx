"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField"; 
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
import { AlertTriangle, Info } from "lucide-react";

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
type ClassSchema = Omit<ClassSchemaBase, "academicYear" | "isActive" | "semester"> & {
  academicYear: string;
  isActive: boolean;
  semester: "GANJIL" | "GENAP";
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
  const [semesterWarning, setSemesterWarning] = useState<string | null>(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  
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
    semester: data?.semester,
    isActive: typeof data?.isActive === "boolean" ? data.isActive : true,
  };

  const {
    register,
    handleSubmit,
    control, // Tambahkan control untuk SelectField
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues,
  });

  // Watch semester changes
  const currentSemester = watch("semester");
  const originalSemester = data?.semester;

  // Check for existing data when semester changes
  useEffect(() => {
    if (type === "update" && data?.id && currentSemester !== originalSemester) {
      // Check if class has existing data
      const checkExistingData = async () => {
        try {
          const response = await fetch(`/api/classes/${data.id}/check-data`);
          const result = await response.json();
          
          if (result.hasData) {
            setHasExistingData(true);
            setSemesterWarning(
              `⚠️ PERINGATAN: Kelas ini memiliki ${result.examCount} ujian dan ${result.assignmentCount} tugas dengan nilai. ` +
              `Mengubah semester dari ${originalSemester} ke ${currentSemester} tidak akan menghapus data tersebut. ` +
              `Data akan tetap tersimpan tetapi mungkin tidak sesuai dengan semester baru.`
            );
          } else {
            setHasExistingData(false);
            setSemesterWarning(null);
          }
        } catch (error) {
          console.error("Error checking existing data:", error);
          // If we can't check, assume there might be data
          setHasExistingData(true);
          setSemesterWarning(
            `⚠️ PERINGATAN: Mengubah semester dari ${originalSemester} ke ${currentSemester}. ` +
            `Pastikan tidak ada data ujian/tugas yang perlu dipertahankan.`
          );
        }
      };
      
      checkExistingData();
    } else {
      setHasExistingData(false);
      setSemesterWarning(null);
    }
  }, [currentSemester, originalSemester, data?.id, type]);

  // Prepare options for SelectField
  const teacherOptions = [
    { value: "", label: "Pilih Wali Kelas" },
    ...teachers.map((teacher: {
      id: string;
      name: string;
      surname: string;
      isSupervisor?: boolean;
    }) => {
      const isDisabled = teacher.isSupervisor && teacher.id !== currentSupervisorId;
      return {
        value: teacher.id,
        label: `${teacher.name} ${teacher.surname}${isDisabled ? " (Already a supervisor)" : ""}`,
        isDisabled
      };
    })
  ];

  const gradeOptions = [
    { value: "", label: "Pilih Tingkatan" },
    ...grades.map((grade: { id: number; level: number }) => ({
      value: grade.id.toString(),
      label: grade.level.toString()
    }))
  ];

  const academicYearOptions = academicYears.map((year) => ({
    value: year,
    label: year
  }));

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
          `Kelas telah ${type === "create" ? "dibuat" : "diperbarui"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(
          result.message || "Gagal menyimpan data kelas. Silakan coba lagi."
        );
      }
    } catch (error) {
      console.error("Kesalahan pengiriman formulir:", error);
      toast.error("Terjadi kesalahan yang tidak diharapkan. Silakan coba lagi.");
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Kelas Baru" : "Memperbarui Kelas"}
      </h1>

      {/* Semester Warning */}
      {semesterWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">Perubahan Semester</p>
              <p>Apakah Anda yakin ingin mengubah semester? Data lama tetap tersimpan.</p>
            </div>
          </div>
        </div>
      )}

      {/* Info for new classes */}
      {type === "create" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informasi Semester</p>
              <p>• Pilih semester yang sesuai dengan periode akademik saat ini</p>
              <p>• Data nilai akan terpisah berdasarkan semester</p>
              <p>• Gunakan filter semester untuk beralih antar periode</p>
            </div>
          </div>
        </div>
      )}

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
        
        {/* Wali Kelas menggunakan SelectField */}
        <SelectField
          label="Wali Kelas"
          name="supervisorId"
          control={control}
          options={teacherOptions}
          error={errors?.supervisorId}
          placeholder="Pilih Wali Kelas"
          isClearable={true}
          isSearchable={true}
        />

        {/* Tingkat menggunakan SelectField */}
        <div className="w-full md:w-1/4">
          <SelectField
            label="Tingkat"
            name="gradeId"
            control={control}
            options={gradeOptions}
            error={errors?.gradeId}
            placeholder="Pilih Tingkatan"
            isClearable={false}
            isSearchable={false}
          />
        </div>

        {/* Tahun Ajaran menggunakan SelectField */}
        <div className="w-full md:w-1/4">
          <SelectField
            label="Tahun Ajaran"
            name="academicYear"
            control={control}
            options={academicYearOptions}
            error={errors?.academicYear}
            placeholder="Pilih Tahun Ajaran"
            isClearable={false}
            isSearchable={true}
          />
        </div>

        {/* Semester menggunakan SelectField */}
        <div className="w-full md:w-1/4">
          <SelectField
            label="Semester"
            name="semester"
            control={control}
            options={[
              { value: "GANJIL", label: "GANJIL" },
              { value: "GENAP", label: "GENAP" },
            ]}
            error={errors?.semester}
            placeholder="Pilih Semester"
            isClearable={false}
            isSearchable={false}
          />
        </div>

        {/* Checkbox untuk Status Aktif */}
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