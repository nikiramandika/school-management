import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth, clerkClient } from "@clerk/nextjs"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Delete user from Clerk first
    await clerkClient.users.deleteUser(params.id)

    // Then delete from database
    const teacher = await prisma.teacher.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("[TEACHER_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 