import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: any) {
  try {
    const { id } = await params;
    const entity = await prisma.entity.findUnique({
      where: { id },
      include: {
        category: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!entity) {
      return new NextResponse("Entity not found", { status: 404 });
    }

    return NextResponse.json(entity);
  } catch (error) {
    console.error("[ENTITY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(request: Request, { params }: any) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateData: any = {};

    if (body.hasOwnProperty("isVerified")) {
      updateData.isVerified = body.isVerified;
    }

    if (body.hasOwnProperty("isActive")) {
      updateData.isActive = body.isActive;
    }

    if (body.name) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.categoryId) updateData.categoryId = body.categoryId;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    const entity = await prisma.entity.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(entity);
  } catch (error) {
    console.error("Error updating entity:", error);
    return NextResponse.json(
      { error: "Error updating entity" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const { id } = await params;
    await prisma.entity.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ENTITY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
