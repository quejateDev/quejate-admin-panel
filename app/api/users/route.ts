import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get("entityId");

  try {
    const clients = await prisma.user.findMany({
      where: {
        role: {
          in: ["EMPLOYEE", "ADMIN"],
        },
        entityId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        role: true,
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Error fetching clients" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { email, name, phone, password, role, entityId, departmentId } =
      await req.json();

    // Persistir el rol elegido (solo EMPLOYEE/ADMIN; por defecto EMPLOYEE).
    const safeRole = role === "ADMIN" ? "ADMIN" : "EMPLOYEE";

    const client = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: await hash(password, 10),
        role: safeRole,
        // entityId/departmentId opcionales: vacío -> null para no romper la FK.
        entityId: entityId || null,
        departmentId: departmentId || null,
      },
    });

    return NextResponse.json(client);
  } catch (error: any) {
    // Email duplicado (unique constraint) -> 409 en vez de 500.
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo" },
        { status: 409 }
      );
    }

    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Error creating client" },
      { status: 500 }
    );
  }
}
