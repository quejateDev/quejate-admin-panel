import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { sendPQRCreationEmail } from "@/services/email/Resend.service";
import { sendPQRNotificationEmail } from "@/services/email/sendPQRNotification";
import { currentUser, currentRole } from "@/lib/auth";
import { calculateDueDate, getOverdueInfo } from "@/utils/dateHelpers";

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

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

  try {
    const formData = await req.formData();
    const jsonData = formData.get("data");

    if (!jsonData) {
      return NextResponse.json({ error: "Missing PQR data" }, { status: 400 });
    }

    const body = JSON.parse(jsonData as string);

    // Solo validar reCAPTCHA en producción
    if (process.env.NODE_ENV === 'production') {
      if (!body.recaptchaToken) {
        return NextResponse.json(
          { error: 'reCAPTCHA token is required' },
          { status: 400 }
        );
      }

      const isRecaptchaValid = await verifyRecaptcha(body.recaptchaToken);
      if (!isRecaptchaValid) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    if (!body.type) {
      return NextResponse.json(
        { error: "El tipo de solicitud es requerido" },
        { status: 400 }
      );
    }

    if (!body.entityId) {
      return NextResponse.json(
        { error: "La entidad es requerida" },
        { status: 400 }
      );
    }

    let maxResponseTime = 15; 

    if (body.departmentId) {
      const departmentConfig = await prisma.pQRConfig.findFirst({
        where: { departmentId: body.departmentId },
        select: { maxResponseTime: true },
      });
      
      if (departmentConfig) {
        maxResponseTime = departmentConfig.maxResponseTime;
      }
    } else {
      const entityConfig = await prisma.pQRConfig.findFirst({
        where: { entityId: body.entityId },
        select: { maxResponseTime: true },
      });
      
      if (entityConfig) {
        maxResponseTime = entityConfig.maxResponseTime;
      }
    }

    // Calcular fecha límite considerando días hábiles colombianos
    const dueDate = calculateDueDate(new Date(), maxResponseTime);

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

    const today = new Date();
    const fechaConsecutivo = today.toISOString().split('T')[0].replace(/-/g, '');

    const pqrCountToday = await prisma.pQRS.count({
      where: {
        entityId: body.entityId,
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lt: new Date(today.setHours(23, 59, 59, 999)),
        },
      },
    });

    const dailyCounter = pqrCountToday + 1;
    const newConsecutiveCode = `${consecutiveCode.code}-${fechaConsecutivo}-${dailyCounter}`;
    
    let creatorPhone = null;
    if (body.includePhone && !body.isAnonymous && body.creatorId) {
      const creator = await prisma.user.findUnique({
        where: { id: body.creatorId },
        select: { phone: true },
      });
      creatorPhone = creator?.phone || null;
    }

    // Obtener dirección legible si hay coordenadas
    let locationAddress: string | undefined = undefined;
    if (body.latitude && body.longitude) {
      try {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${body.latitude}&lon=${body.longitude}&format=json&accept-language=es`,
          { headers: { "Accept-Language": "es" } }
        );
        const geoData = await geoResponse.json();
        if (geoData.display_name) {
          locationAddress = geoData.display_name;
        }
      } catch (error) {
        console.error("Error obteniendo dirección:", error);
      }
    }
    
    // Create PQR with attachments
    const [pqr] = await prisma.$transaction([
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
          guestName: body.guestName,
          guestEmail: body.guestEmail,
          guestPhone: body.guestPhone,
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
                thumbnailUrl: attachment.thumbnailUrl ?? null,
              })),
            },
          },
          consecutiveCode: newConsecutiveCode,
          latitude: body.latitude || null,
          longitude: body.longitude || null,
        },
        include: {
          department: true, 
          entity: true,
          customFieldValues: true,
          attachments: true,
          creator: true,
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
      where: { 
        id: body.entityId,
      },
      select: { name: true, email: true },
    });

    if (!entity) {
      return NextResponse.json(
        { error: "Entity not found" },
        { status: 404 }
      );
    }

    if (!pqr.consecutiveCode) {
      throw new Error("No consecutive code found for this PQR");
    }

    let recipientEmail: string | null = null;
    let recipientName: string = '';

    if (body.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: body.departmentId },
        select: { email: true, name: true },
      });

      if (department?.email) {
        recipientEmail = department.email;
        recipientName = department.name;
      }
    }

    if (!recipientEmail) {
      if (entity.email) {
        recipientEmail = entity.email;
        recipientName = entity.name;
      } else {
        return NextResponse.json(
          { error: "No email found for this entity or department" },
          { status: 400 }
        );
      }
    }

    let contactInfo = {
      name: 'Anónimo',
      email: 'Anónimo',
      phone: 'Anónimo'
    };

    if (!body.isAnonymous) {
      if (body.creatorId) {
        // Usuario registrado - obtener datos del creator
        const creator = await prisma.user.findUnique({
          where: { id: body.creatorId },
          select: { name: true, email: true, phone: true },
        });
        
        contactInfo = {
          name: creator?.name || 'Usuario registrado',
          email: creator?.email || 'No proporcionado',
          phone: creatorPhone || 'No proporcionado'
        };
      } else {
        // Usuario no registrado
        contactInfo = {
          name: body.guestName || 'No proporcionado',
          email: body.guestEmail || 'No proporcionado',
          phone: body.guestPhone || 'No proporcionado'
        };
      }
    }

    // Enviar notificación al destinatario (departamento o entidad)
    await sendPQRNotificationEmail(
      recipientEmail,
      recipientName,
      { ...pqr, locationAddress },
      contactInfo
    );

    // Solo enviar correo de confirmación a usuarios registrados
    if (body.creatorId) {
      const creator = await prisma.user.findUnique({
        where: { id: body.creatorId },
        select: { name: true, email: true },
      });
      
      if (creator?.email) {
        await sendPQRCreationEmail(
          creator.email,
          creator.name || "Usuario registrado",
          "Registro exitoso de PQR @quejate.com.co",
          pqr.consecutiveCode,
          new Date(pqr.createdAt).toLocaleString("es-CO", {
            timeZone: "America/Bogota",
          }),
          `https://quejate.com.co/dashboard/pqr/${pqr.id}`,
          entity.name,
          recipientEmail
        );
      }
    }

    return NextResponse.json(pqr);
  } catch (error: any) {
    console.error("Error in POST /api/pqr:", error.stack);

    // La creación del PQR y el incremento del consecutivo ocurren dentro de un
    // prisma.$transaction atómico: si algo falla allí, nada se persiste, por lo
    // que no hace falta un rollback manual. (El rollback anterior referenciaba
    // campos inexistentes del modelo PQRS y, por shadowing de `pqr`, nunca se
    // ejecutaba: solo enmascaraba el error real con un 500.)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}