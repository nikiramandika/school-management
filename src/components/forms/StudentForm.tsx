"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

const StudentForm = ({
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
    setError,
    reset,
    control,
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      id: data?.id,
      username: data?.username,
      name: data?.name,
      surname: data?.surname,
      email: data?.email || "",
      phone: data?.phone || "",
      address: data?.address,
      bloodType: data?.bloodType,
      sex: data?.sex,
      birthday: data?.birthday,
      classId: data?.classId,
    },
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      reset({
        id: data.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        classId: data.classId,
      });
    }
  }, [data, reset]);

  const onSubmit = useCallback(
    async (formData: StudentSchema) => {
      try {
        console.log("Formulir data sebelum dikirim:", formData);

        const action = type === "create" ? createStudent : updateStudent;
        const result = await action(
          { success: false, error: false, message: "" },
          formData
        );

        console.log("Respons server:", result);

        if (result.success) {
          toast.success(
            `Siswa berhasil ${type === "create" ? "dibuat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          if (result.message.includes("NISN")) {
            setError("username", { message: result.message });
          } else if (result.message.includes("Password")) {
            setError("password", { message: result.message });
          } else if (result.message.includes("Kelas")) {
            setError("classId", { message: result.message });
          } else {
            toast.error(
              result.message || "Gagal menyimpan data siswa. Silakan coba lagi."
            );
          }
        }
      } catch (error) {
        console.error("Kesalahan pengiriman formulir:", error);
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    },
    [type, setOpen, router, setError]
  );

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
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#374151',
      fontSize: '14px',
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

  // Options for dropdowns
  const bloodTypeOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'AB', label: 'AB' },
    { value: 'O', label: 'O' },
  ];

  const sexOptions = [
    { value: 'MALE', label: 'Laki-laki' },
    { value: 'FEMALE', label: 'Perempuan' },
  ];

  const { classes } = relatedData || { classes: [] };
  
  const classOptions = [
    ...classes.map((classItem: { id: number; name: string; grade: { level: number } }) => ({
      value: classItem.id.toString(),
      label: `${classItem.grade.level === 1 ? 'X' : 
               classItem.grade.level === 2 ? 'XI' : 
               classItem.grade.level === 3 ? 'XII' : ''} ${classItem.name}`
    }))
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Siswa Baru" : "Memperbarui Siswa"}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="NISN"
          name="username"
          register={register}
          error={errors?.username}
        />
        {type === "create" && (
          <>
            <InputField
              label="Email"
              name="email"
              register={register}
              error={errors?.email}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors?.password}
            />
          </>
        )}
      </div>
      
      <span className="text-xs text-gray-400 font-medium">
        Informasi Pribadi
      </span>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Nama Depan"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Nama Belakang"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Nomor Hp"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Alamat"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        
        {/* Blood Type Dropdown */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Golongan Darah
          </label>
          <Controller
            control={control}
            name="bloodType"
            render={({ field }) => {
              const selectedOption = bloodTypeOptions.find(
                option => option.value === field.value
              );
              
              return (
                <Select
                  options={bloodTypeOptions}
                  value={selectedOption}
                  onChange={(selected) => field.onChange(selected?.value || null)}
                  styles={customSelectStyles}
                  placeholder="Pilih Golongan Darah"
                  isClearable={true}
                  isSearchable={false}
                />
              );
            }}
          />
          {errors.bloodType?.message && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              {errors.bloodType.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Tanggal Lahir"
          name="birthday"
          defaultValue={data?.birthday?.toISOString().split("T")[0]}
          register={register}
          error={errors.birthday}
          type="date"
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
        
        {/* Sex Dropdown */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Jenis Kelamin
          </label>
          <Controller
            control={control}
            name="sex"
            render={({ field }) => {
              const selectedOption = sexOptions.find(
                option => option.value === field.value
              );
              
              return (
                <Select
                  options={sexOptions}
                  value={selectedOption}
                  onChange={(selected) => field.onChange(selected?.value || null)}
                  styles={customSelectStyles}
                  placeholder="Pilih Jenis Kelamin"
                  isClearable={true}
                  isSearchable={false}
                />
              );
            }}
          />
          {errors.sex?.message && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        
        {/* Class Dropdown */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Kelas
          </label>
          <Controller
            control={control}
            name="classId"
            render={({ field }) => {
              const selectedOption = classOptions.find(
                option => option.value === field.value?.toString()
              );
              
              return (
                <Select
                  options={classOptions}
                  value={selectedOption}
                  onChange={(selected) => field.onChange(selected?.value === '' ? null : parseInt(selected?.value || '0'))}
                  styles={customSelectStyles}
                  placeholder="Pilih Kelas"
                  isClearable={true}
                  isSearchable={true}
                />
              );
            }}
          />
          {errors.classId?.message && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              {errors.classId.message.toString()}
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

export default StudentForm;