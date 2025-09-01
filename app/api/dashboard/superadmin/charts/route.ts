import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { typeMap, statusMap } from '@/constants/pqrMaps';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const pqrsOfYear = await prisma.pQRS.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Procesar datos de PQRs por mes
    const pqrsMonthlyData = new Array(12).fill(0).map((_, index) => {
      const monthName = new Date(currentYear, index).toLocaleDateString('es-ES', { month: 'short' });
      return {
        month: index + 1,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        count: 0,
      };
    });

    pqrsOfYear.forEach((pqr) => {
      const month = pqr.createdAt.getMonth();
      pqrsMonthlyData[month].count += 1;
    });

    const usersOfYear = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Procesar datos de usuarios por mes
    const usersMonthlyData = new Array(12).fill(0).map((_, index) => {
      const monthName = new Date(currentYear, index).toLocaleDateString('es-ES', { month: 'short' });
      return {
        month: index + 1,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        count: 0,
      };
    });

    usersOfYear.forEach((user) => {
      const month = user.createdAt.getMonth();
      usersMonthlyData[month].count += 1;
    });

    const pqrsByCity = await prisma.pQRS.findMany({
      select: {
        entityId: true,
        entity: {
          select: {
            name: true,
            Municipality: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const pqrsByType = await prisma.pQRS.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    const pqrsByStatus = await prisma.pQRS.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const topEntitiesData = await prisma.pQRS.findMany({
      select: {
        entityId: true,
        entity: {
          select: {
            name: true,
          },
        },
      },
    });

    const entityGroups: { [key: string]: { name: string; count: number } } = {};
    topEntitiesData.forEach((pqr) => {
      const entityId = pqr.entityId;
      const entityName = pqr.entity.name;
      if (!entityGroups[entityId]) {
        entityGroups[entityId] = { name: entityName, count: 0 };
      }
      entityGroups[entityId].count += 1;
    });

    const topEntities = Object.entries(entityGroups)
      .map(([entityId, data]) => ({
        entityId,
        entityName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); 

    const response = {
      pqrsByMonth: pqrsMonthlyData,
      usersByMonth: usersMonthlyData,
      pqrsByType: pqrsByType.map((item: any) => ({
        type: typeMap[item.type as keyof typeof typeMap]?.label || item.type,
        count: item._count.id,
      })),
      pqrsByStatus: pqrsByStatus.map((item: any) => ({
        status: statusMap[item.status as keyof typeof statusMap]?.label || item.status,
        count: item._count.id,
      })),
      topEntities,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching SuperAdmin charts data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}