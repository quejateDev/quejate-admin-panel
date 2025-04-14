import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Fetching status history for PQR:", params.id);
    
    // First verify if the PQR exists
    const pqr = await prisma.pQRS.findUnique({
      where: { id: params.id },
      select: { id: true }
    });

    if (!pqr) {
      console.error("PQR not found:", params.id);
      return NextResponse.json(
        { error: "PQR not found" },
        { status: 404 }
      );
    }

    const history = await prisma.pQRStatusHistory.findMany({
      where: {
        pqrId: params.id,
      },
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
    });

    console.log(`Found ${history.length} history records for PQR:`, params.id);
    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching status history:", error);
    return NextResponse.json(
      { error: "Error fetching status history" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Updating status for PQR:", params.id);
    
    const userId = await getUserIdFromToken();
    if (!userId) {
      console.error("Unauthorized attempt to update status");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { status, comment } = await request.json();
    console.log("Received update request:", { status, comment });

    // Validate status
    if (!["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
      console.error("Invalid status received:", status);
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // First check if PQR exists
    const existingPQR = await prisma.pQRS.findUnique({
      where: { id: params.id },
      select: { status: true }
    });

    if (!existingPQR) {
      console.error("PQR not found for status update:", params.id);
      return NextResponse.json(
        { error: "PQR not found" },
        { status: 404 }
      );
    }

    // Don't create history if status hasn't changed
    if (existingPQR.status === status) {
      console.log("Status unchanged, skipping update");
      return NextResponse.json(
        { error: "Status is already set to this value" },
        { status: 400 }
      );
    }

    // Use a transaction to update both the PQR status and create a history record
    const [pqr, history] = await prisma.$transaction([
      prisma.pQRS.update({
        where: {
          id: params.id,
        },
        data: {
          status,
        },
      }),
      prisma.pQRStatusHistory.create({
        data: {
          status,
          comment,
          pqrId: params.id,
          userId,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    console.log("Successfully updated status and created history:", { pqr, history });
    return NextResponse.json({ pqr, history });
  } catch (error) {
    console.error("Error updating PQR status:", error);
    return NextResponse.json(
      { error: "Error updating PQR status" },
      { status: 500 }
    );
  }
} 