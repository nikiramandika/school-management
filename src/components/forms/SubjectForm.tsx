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
            `Mata Pelajaran telah ${type === "create" ? "dibuat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Gagal menyimpan data mata pelajaran. Silakan coba lagi."
          );
        }
      } catch (error) {
        console.error("Kesalahan pengiriman formulir:", error);
        toast.error("Terjadi kesalahan yang tidak diharapkan. Silakan coba lagi.");
      }
    },
    [type, setOpen, router]
  );

  // Get teachers from relatedData with default empty array
  const teachers = relatedData?.teachers || [];

  // Get current teacher IDs
  const currentTeacherIds = data?.teachers?.map((t: any) => t.id) || [];

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '44px',
      border: state.isFocused ? '2px solid #06b6d4' : '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(6, 182, 212, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#06b6d4',
      },
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: '8px 12px',
      gap: '6px',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#f0f9ff',
      border: '1px solid #e0f2fe',
      borderRadius: '6px',
      padding: '2px',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#0c4a6e',
      fontSize: '14px',
      fontWeight: '500',
      padding: '4px 8px',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#64748b',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: '#dc2626',
        color: '#ffffff',
      },
      cursor: 'pointer',
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999,
      marginTop: '4px',
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '8px',
      maxHeight: '200px',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#06b6d4' 
        : state.isFocused 
        ? '#f0f9ff' 
        : 'transparent',
      color: state.isSelected 
        ? '#ffffff' 
        : state.isFocused 
        ? '#0c4a6e' 
        : '#374151',
      borderRadius: '6px',
      margin: '2px 0',
      padding: '10px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: state.isSelected ? '500' : '400',
      '&:active': {
        backgroundColor: '#0891b2',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '14px',
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#374151',
      fontSize: '14px',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: '#d1d5db',
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#06b6d4',
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#dc2626',
      },
    }),
  };

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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Guru
          </label>
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
                      label: `${teacher.name} ${teacher.surname}`,
                    }
                  : { value: id, label: id };
              });
              const mergedOptions = [
                ...teachers.map(
                  (teacher: { id: string; name: string; surname: string }) => ({
                    value: teacher.id,
                    label: `${teacher.name} ${teacher.surname}`,
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
                  placeholder="Pilih guru yang mengajar mata pelajaran ini..."
                  styles={customSelectStyles}
                  noOptionsMessage={() => "Tidak ada guru yang tersedia"}
                  loadingMessage={() => "Memuat data guru..."}
                  isClearable={true}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                />
              );
            }}
          />
          {errors.teachers?.message && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span>⚠️</span>
              {errors.teachers.message.toString()}
            </p>
          )}
        </div>
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