import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const {
      allowAnonymous,
      requireEvidence,
      maxResponseTime,
      notifyEmail,
      autoAssign,
    } = body;

    const entity = await prisma.entity.findUnique({
      where: { id },
      include: {
        Department: true,
      },
    });

    if (!entity) {
      return new NextResponse("Entity not found", { status: 404 });
    }

    let departmentId;
    if (entity.Department.length > 0) {
      departmentId = entity.Department[0].id;
    } else {
      const defaultDepartment = await prisma.department.create({
        data: {
          name: "Departamento General",
          entityId: id,
          description: "Departamento creado automáticamente para configuración PQR",
        },
      });
      departmentId = defaultDepartment.id;
    }

    await prisma.pQRConfig.upsert({
      where: {
        entityId: id,
      },
      update: {
        allowAnonymous,
        requireEvidence,
        maxResponseTime: parseInt(maxResponseTime),
        notifyEmail,
        autoAssign,
      },
      create: {
        entityId: id,
        departmentId: departmentId,
        allowAnonymous,
        requireEvidence,
        maxResponseTime: parseInt(maxResponseTime),
        notifyEmail,
        autoAssign,
      },
    });

    return NextResponse.json({});
  } catch (error) {
    console.error("[ENTITY_PQR_CONFIG_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: any 
) {
  try {
    const { id } = await params;

    const pqrConfig = await prisma.pQRConfig.findUnique({
      where: {
        entityId: id,
      },
      include: {
        customFields: true,
      }
    });

    return NextResponse.json(pqrConfig);
  } catch (error) {
    console.error("[ENTITY_PQR_CONFIG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
