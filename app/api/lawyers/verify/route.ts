import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const { lawyerId, isVerified } = await request.json();

    if (!lawyerId || typeof isVerified !== "boolean") {
      return NextResponse.json(
        { error: "lawyerId and isVerified (boolean) are required" },
        { status: 400 }
      );
    }

    const existingLawyer = await prisma.lawyer.findUnique({
      where: {
        id: lawyerId,
      },
    });

    if (!existingLawyer) {
      return NextResponse.json(
        { error: "Lawyer not found" },
        { status: 404 }
      );
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: {
        id: lawyerId,
      },
      data: {
        isVerified,
      },
      select: {
        id: true,
        isVerified: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Lawyer verification status updated successfully`,
      lawyer: updatedLawyer,
    });
  } catch (error) {
    console.error("Error updating lawyer verification:", error);
    return NextResponse.json(
      { error: "Error updating lawyer verification status" },
      { status: 500 }
    );
  }
}