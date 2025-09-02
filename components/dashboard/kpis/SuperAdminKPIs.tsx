"use client";

import { useEffect, useState } from 'react';
import { FileText, Building2, Users, Scale, AlertTriangle } from 'lucide-react';
import KPICard from './KPICard';
import { SuperAdminKPI } from '../types/dashboard';


export default function SuperAdminKPIs() {
  const [data, setData] = useState<SuperAdminKPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/dashboard/superadmin/kpis');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching SuperAdmin KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="text-red-400 mr-2" size={20} />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total PQRDS"
        value={data?.totalPQRDS.toLocaleString() || '0'}
        description="En todo el sistema"
        icon={<FileText size={24} className="text-quaternary" />}
        trend={data?.trends ? {
          value: data.trends.pqrsTrend,
          isPositive: data.trends.pqrsTrend >= 0
        } : undefined}
        loading={loading}
      />
      
      <KPICard
        title="Entidades"
        value={data?.totalEntities.toLocaleString() || '0'}
        description="Registradas en el sistema"
        icon={<Building2 size={24} className="text-quaternary" />}
        trend={data?.trends ? {
          value: data.trends.entitiesTrend,
          isPositive: data.trends.entitiesTrend >= 0
        } : undefined}
        loading={loading}
      />
      
      <KPICard
        title="Usuarios"
        value={data?.totalUsers.toLocaleString() || '0'}
        description="Ciudadanos registrados"
        icon={<Users size={24} className="text-quaternary" />}
        trend={data?.trends ? {
          value: data.trends.usersTrend,
          isPositive: data.trends.usersTrend >= 0
        } : undefined}
        loading={loading}
      />
      
      <KPICard
        title="Abogados"
        value={data?.totalLawyers.toLocaleString() || '0'}
        description="Abogados activos"
        icon={<Scale size={24} className="text-quaternary" />}
        trend={data?.trends ? {
          value: data.trends.lawyersTrend,
          isPositive: data.trends.lawyersTrend >= 0
        } : undefined}
        loading={loading}
      />
    </div>
  );
}