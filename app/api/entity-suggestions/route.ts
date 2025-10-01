import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import geoData from "@/data/colombia-geo.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = status ? { status: status as any } : {};

    const departmentMap = new Map<string, string>();
    const municipalityMap = new Map<string, string>();

    geoData.departments.forEach((dept) => {
      departmentMap.set(dept.id, dept.name);
      dept.municipalities.forEach((mun) => {
        municipalityMap.set(mun.id, mun.name);
      });
    });

    const [suggestions, total] = await Promise.all([
      prisma.entitySuggestion.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.entitySuggestion.count({ where }),
    ]);

    const result = suggestions.map((suggestion) => ({
      ...suggestion,
      departmentName: departmentMap.get(suggestion.regionalDepartmentId) || null,
      municipalityName: suggestion.municipalityId
        ? municipalityMap.get(suggestion.municipalityId) || null
        : null,
    }));

    return NextResponse.json({
      suggestions: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching entity suggestions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    if (!status || !["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "IMPLEMENTED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    const updatedSuggestion = await prisma.entitySuggestion.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: "Status updated successfully",
      suggestion: updatedSuggestion,
    });
  } catch (error) {
    console.error("Error updating entity suggestion status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
