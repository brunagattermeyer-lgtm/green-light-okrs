import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ACTIONS, AREAS, OBJETIVOS } from '@/data/okrData';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

const OkrCharts: React.FC = () => {
  // Actions per area
  const areaData = AREAS.map(area => ({
    name: area.name,
    color: area.color,
    count: ACTIONS.filter(a => a.area === area.key && !a.sub).length,
  }));

  // Actions per objective
  const obj1Actions = ACTIONS.filter(a => !a.sub && (a.kr === 'horas' || a.kr === 'retificacoes')).length;
  const obj2Actions = ACTIONS.filter(a => !a.sub && (a.kr === 'ces' || a.kr === 'nps')).length;

  const barData = {
    labels: areaData.map(a => a.name),
    datasets: [{
      data: areaData.map(a => a.count),
      backgroundColor: areaData.map(a => a.color),
      borderRadius: 6,
      maxBarThickness: 40,
    }],
  };

  const doughnutData = {
    labels: ['Obj 1 — Confiabilidade', 'Obj 2 — Experiência'],
    datasets: [{
      data: [obj1Actions, obj2Actions],
      backgroundColor: ['#005216', '#36523D'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-3.5 mb-8">
      <div className="bg-okr-su border border-okr-bl rounded-lg p-5 shadow-card">
        <h3 className="text-[13px] font-medium text-okr-dk mb-4">Ações por área</h3>
        <div className="h-52">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0D2601' } },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#e8f0e8' } },
              },
            }}
          />
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {areaData.map(a => (
            <div key={a.name} className="flex items-center gap-1.5 text-[11px] text-okr-mi">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
              {a.name} ({a.count})
            </div>
          ))}
        </div>
      </div>

      <div className="bg-okr-su border border-okr-bl rounded-lg p-5 shadow-card">
        <h3 className="text-[13px] font-medium text-okr-dk mb-4">Ações por objetivo</h3>
        <div className="h-52 flex items-center justify-center">
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '68%',
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0D2601' } },
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5 mt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-okr-mi">
            <span className="w-2 h-2 rounded-full bg-[#005216]" />
            Obj 1 — Confiabilidade ({obj1Actions})
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-okr-mi">
            <span className="w-2 h-2 rounded-full bg-[#36523D]" />
            Obj 2 — Experiência ({obj2Actions})
          </div>
        </div>
      </div>
    </div>
  );
};

export default OkrCharts;
