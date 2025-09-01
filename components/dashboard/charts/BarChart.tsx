"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: Array<{
    [key: string]: any;
  }>;
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
  height?: number;
}

export default function BarChart({ 
  data, 
  xKey, 
  yKey, 
  color = '#005DD6', 
  title = 'Gráfico de Barras',
  height = 300 
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => {
      const label = item[xKey];
      return label.length > 20 ? `${label.substring(0, 17)}...` : label;
    }),
    datasets: [
      {
        label: title,
        data: data.map(item => item[yKey]),
        backgroundColor: `${color}80`,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            const index = context[0].dataIndex;
            return data[index][xKey];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
