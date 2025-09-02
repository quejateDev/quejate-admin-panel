import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: any 
) {
  const { id } = await params;

  try {
    const client = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        email: true,
        name: true,
        Entity: {
          select: {
            id: true,
            name: true,
          },
        },
        role: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Error fetching client" },
      { status: 500 }
    );
  }
}