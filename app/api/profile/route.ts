import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { currentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUs = await currentUser();
    const userId = currentUs?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUs = await currentUser();
    const userId = currentUs?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
