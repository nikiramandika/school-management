"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { SubjectSchema, subjectSchema } from "@/lib/formValidationSchemas";
import { createSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const initialState = {
  success: false,
  error: false,
};

const SubjectForm = ({
  type,
  data,
  setOpen
}: {
  type: "create" | "update";
  data?: any;
  setOpen:Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    formState: { errors },
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: data?.name || "",
    },
  });

  const [state, formAction] = useActionState(createSubject, initialState);

  const router = useRouter()
  
  useEffect(() => {
    if (state.success) {
        toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
    }
    }, [state]);


  return (
    <form className="flex flex-col gap-8" action={formAction}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          name="name"
          register={register}
          error={errors?.name}
        />
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;
