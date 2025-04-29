import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getCookie, verifyToken } from "@/lib/utils";
export async function GET() {
  try {
    const token = await getCookie("token");
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
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
    const token = await getCookie("token");
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName } = body;

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
