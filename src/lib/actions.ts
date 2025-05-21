"use server";

import { revalidatePath } from "next/cache";
import { subjectSchema } from "./formValidationSchemas";
import prisma from "./prisma";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  _prevState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const name = formData.get("name");

  const parsed = subjectSchema.safeParse({ name });

  if (!parsed.success) {
    console.error("Validation failed", parsed.error);
    return { success: false, error: true };
  }

  try {
    await prisma.subject.create({
      data: {
        name: parsed.data.name,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("DB error", err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  _prevState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;
  const name = formData.get("name");

  const parsed = subjectSchema.safeParse({ name });

  if (!parsed.success || !id) {
    console.error("Validation failed", parsed.error);
    return { success: false, error: true };
  }

  try {
    await prisma.subject.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: parsed.data.name,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("DB error", err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  _prevState: CurrentState,
  formData: FormData
): Promise<CurrentState> => {
  const id = formData.get("id") as string;

  if (!id) {
    console.error("ID is missing");
    return { success: false, error: true };
  }

  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("DB error", err);
    return { success: false, error: true };
  }
};
