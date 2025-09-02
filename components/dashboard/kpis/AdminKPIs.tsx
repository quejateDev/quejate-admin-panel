"use client";

import { useEffect, useState } from 'react';
import { FileText, Users, Building, AlertTriangle } from 'lucide-react';
import KPICard from './KPICard';
import { AdminKPI } from '../types/dashboard';


export default function AdminKPIs() {
  const [data, setData] = useState<AdminKPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/dashboard/admin/kpis');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching Admin KPIs:', err);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <KPICard
        title="Total PQRDS"
        value={data?.totalPQRDS.toLocaleString() || '0'}
        description="En su entidad"
        icon={<FileText size={24} className="text-quaternary" />}
        trend={data?.trends ? {
          value: data.trends.pqrsTrend,
          isPositive: data.trends.pqrsTrend >= 0
        } : undefined}
        loading={loading}
      />
      
      <KPICard
        title="Empleados"
        value={data?.totalEmployees.toLocaleString() || '0'}
        description="Personal de la entidad"
        icon={<Users size={24} className="text-quaternary" />}
        trend={data?.trends ? {
          value: data.trends.employeesTrend,
          isPositive: data.trends.employeesTrend >= 0
        } : undefined}
        loading={loading}
      />
      
      {(data?.totalDepartments ?? 0) > 0 && (
        <KPICard
          title="Áreas"
          value={data?.totalDepartments.toLocaleString() || '0'}
          description="Áreas de la entidad"
          icon={<Building size={24} className="text-quaternary" />}
          trend={data?.trends ? {
            value: data.trends.departmentsTrend,
            isPositive: data.trends.departmentsTrend >= 0
          } : undefined}
          loading={loading}
        />
      )}
    </div>
  );
}
