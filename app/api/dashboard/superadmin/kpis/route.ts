import { auth } from '@/auth';
import prisma from '@/lib/prisma';
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

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo los super administradores pueden acceder a esta información.' },
        { status: 403 }
      );
    }

    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      totalPQRDS,
      totalEntities,
      totalUsers,
      totalLawyers,
      lastMonthPQRDS,
      lastMonthEntities,
      lastMonthUsers,
      lastMonthLawyers
    ] = await Promise.all([
      prisma.pQRS.count(),
      prisma.entity.count(),
      prisma.user.count({
        where: {
          role: {
            in: ['CLIENT', 'ADMIN', 'EMPLOYEE']
          }
        }
      }),
      prisma.lawyer.count({
        where: {
          isVerified: true
        }
      }),
      
      prisma.pQRS.count({
        where: {
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      prisma.entity.count({
        where: {
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      prisma.user.count({
        where: {
          role: {
            in: ['CLIENT', 'ADMIN', 'EMPLOYEE']
          },
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      prisma.lawyer.count({
        where: {
          isVerified: true,
          createdAt: {
            lt: lastMonth
          }
        }
      })
    ]);

    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const trends = {
      pqrsTrend: calculateTrend(totalPQRDS, lastMonthPQRDS),
      entitiesTrend: calculateTrend(totalEntities, lastMonthEntities),
      usersTrend: calculateTrend(totalUsers, lastMonthUsers),
      lawyersTrend: calculateTrend(totalLawyers, lastMonthLawyers)
    };

    const kpiData = {
      totalPQRDS,
      totalEntities,
      totalUsers,
      totalLawyers,
      trends
    };

    return NextResponse.json(kpiData);

  } catch (error) {
    console.error('Error fetching SuperAdmin KPIs:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al obtener las métricas',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
