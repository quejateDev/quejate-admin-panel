import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { sendPQRCreationEmail } from "@/services/email/Resend.service";
import { sendPQRNotificationEmail } from "@/services/email/sendPQRNotification";
import { getCookie, verifyToken } from "@/lib/utils";
import { GETPQRSchema, GetPQRsDTO } from "@/dto/pqr.dto";

export async function GET(
  req: NextRequest
): Promise<NextResponse<GetPQRsDTO[] | { error: string }>> {
  const { searchParams } = new URL(req.url);
  const token = await getCookie("token");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId, departmentId, startDate, endDate, status, type } =
    GETPQRSchema.parse({
      organizationId: decoded.entityId,
      ...Object.fromEntries(searchParams),
    });

  try {
    const pqrs = await prisma.pQRS.findMany({
      where: {
        department: {
          id: departmentId || undefined,
          entityId: organizationId,
        },
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
        status: status || undefined,
        type: type || undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        department: {
          include: {
            entity: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        creator: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(pqrs);
  } catch (error) {
    console.error("Error fetching PQRs:", error);
    return NextResponse.json({ error: "Error fetching PQRs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json(
      { error: "Request body is missing" },
      { status: 400 }
    );
  }

  let pqr: any;

  try {
    const formData = await req.formData();
    const jsonData = formData.get("data");

    if (!jsonData) {
      return NextResponse.json({ error: "Missing PQR data" }, { status: 400 });
    }

    const body = JSON.parse(jsonData as string);

    // Validate required fields
    if (!body.type || !body.departmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const pqrConfig = await prisma.pQRConfig.findFirst({
      where: {
        departmentId: body.departmentId,
      },
      select: {
        maxResponseTime: true,
      },
    });

    if (!pqrConfig) {
      return NextResponse.json(
        { error: "No PQR configuration found for this department" },
        { status: 400 }
      );
    }

    // Calculate due date based on maxTimeResponse (in days)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + pqrConfig.maxResponseTime);

    const consecutiveCode = await prisma.entityConsecutive.findFirst({
      where: {
        entityId: body.entityId,
      },
    });

    if (!consecutiveCode) {
      return NextResponse.json(
        { error: "No consecutive code found for this entity" },
        { status: 400 }
      );
    }

    const fechaConsecutivo = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");

    // Create PQR with attachments
    const [pqr, entityConsecutive] = await prisma.$transaction([
      prisma.pQRS.create({
        data: {
          type: body.type,
          dueDate,
          anonymous: body.isAnonymous || false,
          departmentId: body.departmentId,
          creatorId: body.creatorId,
          customFieldValues: {
            create: body.customFields.map((field: any) => ({
              name: field.name,
              value: field.value,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required,
            })),
          },
          private: body.isPrivate || false,
          attachments: {
            createMany: {
              data: body.attachments.map((attachment: any) => ({
                name: attachment.name,
                url: attachment.url,
                type: attachment.type,
                size: attachment.size,
              })),
            },
          },
          consecutiveCode: `${consecutiveCode.code}-${fechaConsecutivo}-${consecutiveCode.consecutive}`,
          statusHistory: {
            create: {
              status: "PENDING",
              comment: "PQR creada",
              userId: body.creatorId,
            },
          },
        },
        include: {
          department: true,
          customFieldValues: true,
          attachments: true,
          creator: true,
          statusHistory: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),
      prisma.entityConsecutive.update({
        where: { id: consecutiveCode.id },
        data: {
          consecutive: consecutiveCode.consecutive + 1,
        },
      }),
    ]);

    const entity = await prisma.entity.findUnique({
      where: { id: body.entityId },
      select: { name: true, email: true },
    });

    if (!pqr.consecutiveCode) {
      throw new Error("No consecutive code found for this PQR");
    }

    if (entity?.email) {
      await sendPQRNotificationEmail(
        entity.email,
        entity.name,
        pqr,
        pqr.creator,
        pqr.customFieldValues,
        pqr.attachments,
        pqr.consecutiveCode
      );
    } else {
      throw new Error("No email found for this entity");
    }

    if (pqr.creator?.email) {
      await sendPQRCreationEmail(
        pqr.creator?.email,
        pqr.creator?.firstName || "John Doe",
        "Registro exitoso de PQR @quejate.com.co",
        pqr.consecutiveCode,
        new Date(pqr.createdAt).toLocaleString("es-CO", {
          timeZone: "America/Bogota",
        }),
        `https://quejate.com.co/dashboard/pqr/${pqr.id}`
      );
    }

    return NextResponse.json(pqr);
  } catch (error: any) {
    console.error("Error in POST /api/pqr:", error.stack);

    if (pqr && pqr.id) {
      await prisma.$transaction([
        prisma.pQRS.delete({
          where: {
            id: pqr.id,
          },
        }),
        prisma.entityConsecutive.update({
          where: { id: pqr.entityConsecutiveId },
          data: {
            consecutive: pqr.entityConsecutive.consecutive - 1,
          },
        }),
      ]);
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
