import prisma from "@/lib/prisma";
import { currentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const responses = await prisma.entityResponse.findMany({
      where: {
        pqrId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Error fetching responses" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Response text is required" },
        { status: 400 }
      );
    }

    const pqr = await prisma.pQRS.findUnique({
      where: { id },
      select: { id: true, entityId: true },
    });

    if (!pqr) {
      return NextResponse.json(
        { error: "PQRS not found" },
        { status: 404 }
      );
    }

    const userWithEntity = await prisma.user.findUnique({
      where: { id: user.id },
      select: { entityId: true, role: true },
    });

    const role = userWithEntity?.role ?? user.role;
    const isSuperAdmin = role === "SUPER_ADMIN";
    const belongsToEntity =
      userWithEntity?.entityId === pqr.entityId;

    if (!isSuperAdmin && !belongsToEntity) {
      return NextResponse.json(
        { error: "You are not authorized to respond to this PQRS" },
        { status: 403 }
      );
    }

    const response = await prisma.entityResponse.create({
      data: {
        text,
        pqrId: id,
        entityId: pqr.entityId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        attachments: true,
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating response:", error);
    return NextResponse.json(
      { error: "Error creating response" },
      { status: 500 }
    );
  }
}
