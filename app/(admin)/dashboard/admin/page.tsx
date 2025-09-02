import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserById } from '@/data/user';
import AdminKPIs from '@/components/dashboard/kpis/AdminKPIs';
import AdminCharts from '@/components/dashboard/sections/AdminCharts';
import prisma from '@/lib/prisma';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  const user = await getUserById(session.user.id);
  
  if (!user || !user.entityId) {
    redirect('/unauthorized');
  }

  const entity = await prisma.entity.findUnique({
    where: { id: user.entityId },
    select: { name: true }
  });

  const entityName = entity?.name || 'Entidad';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard de {entityName}
        </h1>
        <p className="text-gray-600">
          Visión general de su entidad y gestión de PQRSD
        </p>
      </div>

      <AdminKPIs />

      <AdminCharts />
    </div>
  );
}
