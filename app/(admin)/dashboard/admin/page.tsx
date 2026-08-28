import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminKPIs from '@/components/dashboard/kpis/AdminKPIs';
import AdminCharts from '@/components/dashboard/sections/AdminCharts';
import { backendJsonOrNull } from '@/lib/api/backend';

/** Forma de `GET /admin/users/:id/entity` (clave `Entity` en mayúscula). */
interface UserEntityResponse {
  Entity: { id: string; name: string } | null;
}

/**
 * Tablero de la entidad.
 *
 * Antes resolvía la entidad en dos consultas Prisma (`getUserById` y luego
 * `entity.findUnique`); ahora es una sola llamada al backend,
 * `GET /admin/users/:id/entity`, que ya existía y comprueba el alcance —
 * preguntar por uno mismo siempre pasa.
 *
 * La comprobación de rol se conserva en la página porque decide **a dónde
 * redirigir**, que es cosa de la interfaz. La que decide si se ven los datos
 * está en el backend: los `KPI` y las gráficas van por
 * `GET /admin/dashboard/*`, que sí comprueba rol y entidad — antes ninguno de
 * los cuatro tableros lo hacía en su manejador.
 */
export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  const result = await backendJsonOrNull<UserEntityResponse>(
    `/admin/users/${encodeURIComponent(session.user.id)}/entity`,
  );

  if (!result?.Entity) {
    redirect('/unauthorized');
  }

  const entityName = result.Entity.name || 'Entidad';

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
