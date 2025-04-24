import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { assignedToId } = await request.json();
    const { id } = await params;

    // First check if PQR exists
    const existingPQR = await prisma.pQRS.findUnique({
      where: { id },
      include: { department: true }
    });

    if (!existingPQR) {
      return NextResponse.json(
        { error: "PQR not found" },
        { status: 404 }
      );
    }

    // Check if the assigned user belongs to the same department
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { departmentId: true }
      });

      if (!assignedUser || assignedUser.departmentId !== existingPQR.departmentId) {
        return NextResponse.json(
          { error: "Assigned user must belong to the same department" },
          { status: 400 }
        );
      }
    }

    // Update the PQR with the new assignment
    const updatedPQR = await prisma.pQRS.update({
      where: { id },
      data: {
        assignedToId,
        status: assignedToId ? "IN_PROGRESS" : "PENDING",
        statusHistory: {
          create: {
            status: assignedToId ? "IN_PROGRESS" : "PENDING",
            comment: assignedToId ? `Asignado a empleado` : `Asignación removida`,
            userId,
          },
        },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPQR);
  } catch (error) {
    console.error("Error assigning PQR:", error);
    return NextResponse.json(
      { error: "Error assigning PQR" },
      { status: 500 }
    );
  }
} 