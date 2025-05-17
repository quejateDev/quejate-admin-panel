import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employees = await prisma.user.findMany({
      where: {
        entityId: id,
        role: "EMPLOYEE",
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching entity employees:", error);
    return NextResponse.json(
      { error: "Error fetching employees" },
      { status: 500 }
    );
  }
} 