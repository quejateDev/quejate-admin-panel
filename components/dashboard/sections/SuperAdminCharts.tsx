"use client";

import { useState, useEffect } from 'react';
import { SuperAdminCharts } from '../types/dashboard';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';


export default function SuperAdminChartsSection() {
  const [data, setData] = useState<SuperAdminCharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/dashboard/superadmin/charts');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching SuperAdmin Charts:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400 mr-2">⚠️</div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error al cargar gráficos</h3>
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

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Análisis y Estadísticas</h2>
        <p className="text-gray-600">Visualización detallada de datos del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            PQRs Creados en {new Date().getFullYear()}
          </h3>
          {loading ? (
            <LoadingSkeleton />
          ) : data?.pqrsByMonth ? (
            <LineChart
              data={data.pqrsByMonth}
              xKey="monthName"
              yKey="count"
              color="#3b82f6"
              title="PQRSD por mes"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay datos de PQRSD disponibles</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Usuarios Registrados en {new Date().getFullYear()}
          </h3>
          {loading ? (
            <LoadingSkeleton />
          ) : data?.usersByMonth ? (
            <LineChart
              data={data.usersByMonth}
              xKey="monthName"
              yKey="count"
              color="#10b981"
              title="Usuarios por mes"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay datos de usuarios disponibles</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 xl:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top 5 Entidades con más PQRSD
          </h3>
          {loading ? (
            <LoadingSkeleton />
          ) : data?.topEntities && data.topEntities.length > 0 ? (
            <BarChart
              data={data.topEntities}
              xKey="entityName"
              yKey="count"
              color="#005DD6"
              title="PQRSD por entidad"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay datos de entidades disponibles</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            PQRSD por Tipo
          </h3>
          {loading ? (
            <LoadingSkeleton />
          ) : data?.pqrsByType && data.pqrsByType.length > 0 ? (
            <PieChart
              data={data.pqrsByType}
              labelKey="type"
              valueKey="count"
              colors={['#005DD6', '#3E5C84', '#123159', '#10B981', '#F59E0B']}
              title="Distribución por tipo"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay datos de tipos disponibles</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            PQRSD por Estado
          </h3>
          {loading ? (
            <LoadingSkeleton />
          ) : data?.pqrsByStatus && data.pqrsByStatus.length > 0 ? (
            <PieChart
              data={data.pqrsByStatus}
              labelKey="status"
              valueKey="count"
              colors={['#F59E0B', '#3E5C84', '#10B981', '#EF4444']}
              title="Distribución por estado"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay datos de estados disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
