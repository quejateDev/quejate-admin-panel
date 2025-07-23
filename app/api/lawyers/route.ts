import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [lawyers, totalCount] = await Promise.all([
      prisma.lawyer.findMany({
        select: {
          id: true,
          userId: true,
          documentType: true,
          isVerified: true,
          identityDocument: true,
          identityDocumentImage: true,
          professionalCardImage: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
              isActive: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.lawyer.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      data: lawyers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    return NextResponse.json(
      { error: "Error fetching lawyers" },
      { status: 500 }
    );
  }
}