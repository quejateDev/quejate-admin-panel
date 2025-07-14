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
    });

    if (!entity) {
      return new NextResponse("Entity not found", { status: 404 });
    }

    let pqrConfig = await prisma.pQRConfig.findUnique({
      where: { entityId: id },
    });

    if (!pqrConfig) {
      pqrConfig = await prisma.pQRConfig.create({
        data: {
          entityId: id,
          allowAnonymous,
          requireEvidence,
          maxResponseTime: parseInt(maxResponseTime),
          notifyEmail,
          autoAssign,
        },
      });
    } else {
      pqrConfig = await prisma.pQRConfig.update({
        where: { id: pqrConfig.id },
        data: {
          allowAnonymous,
          requireEvidence,
          maxResponseTime: parseInt(maxResponseTime),
          notifyEmail,
          autoAssign,
        },
      });
    }

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
