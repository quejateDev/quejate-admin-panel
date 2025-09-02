import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getUserById } from '@/data/user';
import { NextResponse } from 'next/server';

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
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      totalPQRDS,
      totalEmployees,
      totalDepartments,
      lastMonthPQRDS,
      lastMonthEmployees,
      lastMonthDepartments
    ] = await Promise.all([
      prisma.pQRS.count({
        where: {
          entityId: entityId
        }
      }),
      
      prisma.user.count({
        where: {
          entityId: entityId,
          role: {
            in: ['EMPLOYEE', 'ADMIN']
          }
        }
      }),
      
      prisma.department.count({
        where: {
          entityId: entityId
        }
      }),
      

      prisma.pQRS.count({
        where: {
          entityId: entityId,
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      
      prisma.user.count({
        where: {
          entityId: entityId,
          role: {
            in: ['EMPLOYEE', 'ADMIN']
          },
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      
      prisma.department.count({
        where: {
          entityId: entityId,
          createdAt: {
            lt: lastMonth
          }
        }
      })
    ]);

    const calculateTrend = (current: number, previous: number): number => {
      console.log(`Calculating trend: current=${current}, previous=${previous}`);
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const trends = {
      pqrsTrend: calculateTrend(totalPQRDS, lastMonthPQRDS),
      employeesTrend: calculateTrend(totalEmployees, lastMonthEmployees),
      departmentsTrend: calculateTrend(totalDepartments, lastMonthDepartments)
    };

    const kpiData = {
      totalPQRDS,
      totalEmployees,
      totalDepartments,
      trends
    };

    return NextResponse.json(kpiData);

  } catch (error) {
    console.error('Error fetching Admin KPIs:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al obtener las métricas',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
