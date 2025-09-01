import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SuperAdminKPIs from '@/components/dashboard/kpis/SuperAdminKPIs';
import SuperAdminCharts from '@/components/dashboard/sections/SuperAdminCharts';

export default async function SuperAdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard SuperAdmin
        </h1>
        <p className="text-gray-600">
          Visión general del sistema y todas las entidades
        </p>
      </div>

      <SuperAdminKPIs />

      <SuperAdminCharts />
    </div>
  );
}