import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { customFields } = body;

    let pqrConfig = await prisma.pQRConfig.findUnique({
      where: { entityId: id },
    });

    if (!pqrConfig) {
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

      pqrConfig = await prisma.pQRConfig.create({
        data: {
          entityId: id,
          departmentId: departmentId,
          allowAnonymous: true,
          requireEvidence: false,
          maxResponseTime: 15,
          notifyEmail: true,
          autoAssign: false,
        },
      });
    }

    await prisma.customField.deleteMany({
      where: { configId: pqrConfig.id },
    });

    if (customFields && customFields.length > 0) {
      await prisma.customField.createMany({
        data: customFields.map((field: any) => ({
          configId: pqrConfig.id,
          name: field.name,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          isForAnonymous: field.isForAnonymous,
        })),
      });
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("[ENTITY_PQR_FIELDS_PUT]", error);
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
      where: { entityId: id },
      include: {
        customFields: true,
      },
    });

    if (!pqrConfig) {
      return NextResponse.json({ customFields: [] });
    }

    return NextResponse.json({
      customFields: pqrConfig.customFields || [],
    });
  } catch (error) {
    console.error("[ENTITY_PQR_FIELDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
