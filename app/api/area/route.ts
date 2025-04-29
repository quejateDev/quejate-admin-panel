// app/api/departments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/utils";
import { getCookie } from "@/lib/utils";

export async function GET() {
  const token = await getCookie("token");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, entityId, role } = decoded;

  try {
    const departments = await prisma.department.findMany({
      where: {
        entityId,
        ...(role === "EMPLOYEE" && {
          employees: {
            some: {
              id,
            },
          },
        }),
      },
      include: {
        entity: true,
        employees: true,
        pqrs: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Error fetching departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, entityId } = body;

    const department = await prisma.department.create({
      data: {
        name,
        description,
        entity: {
          connect: {
            id: entityId,
          },
        },
        pqrConfig: {
          create: {},
        },
      },
      include: {
        entity: true,
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Error creating department" },
      { status: 500 }
    );
  }
}
