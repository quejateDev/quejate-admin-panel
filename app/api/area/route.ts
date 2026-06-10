// app/api/departments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser, currentRole } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get("entityId");

  if (!entityId) {
    return NextResponse.json({ error: "Entity ID is required" }, { status: 400 });
  }

  try {
    const departments = await prisma.department.findMany({
      where: {
        entityId,
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
    const user = await currentUser();
    const role = await currentRole();

    if (!user || !role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, email, entityId } = body;

    // Validación defensiva: sin entityId no se intenta el connect (evita el 500).
    if (!entityId) {
      return NextResponse.json(
        { error: "La entidad es requerida para crear un área" },
        { status: 400 }
      );
    }

    // Gating por rol: SUPER_ADMIN crea en cualquier entidad; ADMIN/EMPLOYEE
    // solo en la suya; el resto no puede.
    if (role !== "SUPER_ADMIN") {
      if (role !== "ADMIN" && role !== "EMPLOYEE") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { entityId: true },
      });

      if (!dbUser?.entityId || dbUser.entityId !== entityId) {
        return NextResponse.json(
          { error: "No puedes crear áreas en una entidad ajena" },
          { status: 403 }
        );
      }
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        email,
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
