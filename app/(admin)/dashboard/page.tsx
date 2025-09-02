import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  switch (session.user.role) {
    case 'SUPER_ADMIN':
      redirect('/dashboard/superadmin');
    case 'ADMIN':
      redirect('/dashboard/admin');
    case 'EMPLOYEE':
      redirect('/pqr');
    default:
      redirect('/unauthorized');
  }
}