import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { sendPQRCreationEmail } from "@/services/email/Resend.service";
import { sendPQRNotificationEmail } from "@/services/email/sendPQRNotification";
import { currentUser, currentRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get current user and role
    const user = await currentUser();
    const role = await currentRole();

    if (!user || !role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const departmentId = searchParams.get('departmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const organizationId = searchParams.get('organizationId');
    
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 50);

    // Build where clause based on user role
    const whereClause: any = {
      creatorId: { not: null }
    };

    // Add date filters if provided
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Add department filter if provided
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    // Role-based filtering
    if (role === 'SUPER_ADMIN') {
      // Super admin can see all PQRs - no additional filters needed
      // If organizationId is provided, filter by it (for UI filtering purposes)
      if (organizationId) {
        whereClause.entityId = organizationId;
      }
    } else if (role === 'ADMIN' || role === 'EMPLOYEE') {
      // Admin and employees can only see PQRs from their entity
      // Get user entity using existing endpoint logic
      const userWithEntity = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          entityId: true,
        }
      });

      if (userWithEntity?.entityId) {
        whereClause.entityId = userWithEntity.entityId;
      } else {
        // If user has no entityId, return empty results
        return NextResponse.json({
          pqrs: [],
          hasMore: false,
          nextPage: null
        });
      }
    } else {
      // Other roles (CLIENT, etc.) should not access this endpoint
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pqrs = await prisma.pQRS.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        department: {
          select: {
            name: true,
            entity: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        entity: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true
          },
        },
        customFieldValues: {
          select: {
            name: true,
            value: true,
          },
        },
        attachments: {
          select: {
            name: true,
            url: true,
            type: true,
            size: true,
          },
        }, 
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });

    const totalCount = await prisma.pQRS.count({
  where: whereClause
});

  const hasMore = skip + take < totalCount;

  return NextResponse.json({
    pqrs,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
    totalCount,
  });

  } catch (error) {
    console.error("Error fetching PQRSD:", error);
    return NextResponse.json({ error: "Error fetching PQRSD" }, { status: 500 });
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
          entityId: body.entityId,
          creatorId: body.creatorId,
          subject: body.subject,
          description: body.description,
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
                  name: true,
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
      );
    } else {
      throw new Error("No email found for this entity");
    }

    if (pqr.creator?.email) {
      await sendPQRCreationEmail(
        pqr.creator?.email,
        pqr.creator?.name || "John Doe",
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
