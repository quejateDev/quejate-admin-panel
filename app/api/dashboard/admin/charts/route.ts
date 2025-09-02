import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserById } from '@/data/user';
import prisma from '@/lib/prisma';
import { typeMap, statusMap } from '@/constants/pqrMaps';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo los administradores pueden acceder a esta información.' },
        { status: 403 }
      );
    }

    const user = await getUserById(session.user.id);
    
    if (!user || !user.entityId) {
      return NextResponse.json(
        { error: 'Usuario administrador sin entidad asignada.' },
        { status: 400 }
      );
    }

    const entityId = user.entityId;
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const pqrsOfYear = await prisma.pQRS.findMany({
      where: {
        entityId: entityId,
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        createdAt: true,
      },
    });


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


    const pqrsByDepartment = await prisma.pQRS.findMany({
      where: {
        entityId: entityId,
      },
      select: {
        departmentId: true,
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    const departmentGroups: { [key: string]: { name: string; count: number } } = {};
    pqrsByDepartment.forEach((pqr) => {
      if (pqr.departmentId && pqr.department) {
        const deptId = pqr.departmentId;
        const deptName = pqr.department.name;
        if (!departmentGroups[deptId]) {
          departmentGroups[deptId] = { name: deptName, count: 0 };
        }
        departmentGroups[deptId].count += 1;
      }
    });

    const pqrsByDepartmentData = Object.entries(departmentGroups).map(([deptId, data]) => ({
      departmentId: deptId,
      departmentName: data.name,
      count: data.count,
    }));

    const pqrsByType = await prisma.pQRS.groupBy({
      by: ['type'],
      where: {
        entityId: entityId,
      },
      _count: {
        id: true,
      },
    });


    const pqrsByStatus = await prisma.pQRS.groupBy({
      by: ['status'],
      where: {
        entityId: entityId,
      },
      _count: {
        id: true,
      },
    });

    const response = {
      pqrsByMonth: pqrsMonthlyData,
      pqrsByDepartment: pqrsByDepartmentData,
      pqrsByType: pqrsByType.map((item: any) => ({
        type: typeMap[item.type as keyof typeof typeMap]?.label || item.type,
        count: item._count.id,
      })),
      pqrsByStatus: pqrsByStatus.map((item: any) => ({
        status: statusMap[item.status as keyof typeof statusMap]?.label || item.status,
        count: item._count.id,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Admin charts data:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al obtener los datos de gráficos',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}