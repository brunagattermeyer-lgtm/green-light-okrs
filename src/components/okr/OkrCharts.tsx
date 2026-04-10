import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ACTIONS, AREAS, OBJETIVOS, KRS } from '@/data/okrData';
import { useOkrState } from '@/contexts/OkrStateContext';
import { calcProgressByKr } from '@/lib/progressCalc';
import Modal from './Modal';
import ProgressBar from './ProgressBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

const OkrCharts: React.FC = () => {
  const { actionStates, chipStates } = useOkrState();
  const [showObjModal, setShowObjModal] = useState<number | null>(null);

  const areaData = AREAS.filter(a => a.key !== 'todos').map(area => ({
    name: area.name,
    color: area.color,
    count: ACTIONS.filter(a => a.area === area.key && !a.sub).length,
  }));

  const obj1Actions = ACTIONS.filter(a => !a.sub && (a.kr === 'horas' || a.kr === 'retificacoes')).length;
  const obj2Actions = ACTIONS.filter(a => !a.sub && (a.kr === 'ces' || a.kr === 'nps')).length;

  const barData = {
    labels: areaData.map(a => a.name),
    datasets: [{
      data: areaData.map(a => a.count),
      backgroundColor: areaData.map(a => a.color),
      borderRadius: 6,
      maxBarThickness: 90,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
    }],
  };

  const doughnutData = {
    labels: ['Obj 1 — Confiabilidade', 'Obj 2 — Experiência'],
    datasets: [{
      data: [obj1Actions, obj2Actions],
      backgroundColor: ['#005216', '#2ea043'],
      hoverBackgroundColor: ['#006e1e', '#3bb850'],
      borderWidth: 0,
      hoverOffset: 12,
    }],
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-3.5 mb-8">
        <div className="bg-okr-su border border-okr-bl rounded-xl p-5 shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] hover:shadow-[0_4px_16px_rgba(13,38,1,0.12),0_8px_32px_rgba(13,38,1,0.08)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="text-[13px] font-medium text-okr-dk mb-4">Ações por área</h3>
          <div className="h-64">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0D2601' } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 11, family: 'DM Sans' } } },
                  y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11, family: 'DM Sans' } }, grid: { color: '#e8f0e8' } },
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

        <div className="bg-okr-su border border-okr-bl rounded-xl p-5 shadow-[0_2px_8px_rgba(13,38,1,0.08),0_6px_20px_rgba(13,38,1,0.06)] hover:shadow-[0_4px_16px_rgba(13,38,1,0.12),0_8px_32px_rgba(13,38,1,0.08)] hover:-translate-y-0.5 transition-all duration-300">
          <h3 className="text-[13px] font-medium text-okr-dk mb-4">Ações por objetivo</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '55%',
                plugins: {
                  legend: { display: false },
                  tooltip: { backgroundColor: '#0D2601' },
                },
                onClick: (_event, elements) => {
                  if (elements.length > 0) {
                    setShowObjModal(elements[0].index + 1);
                  }
                },
                onHover: (event, elements) => {
                  const canvas = event.native?.target as HTMLCanvasElement;
                  if (canvas) {
                    canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                  }
                },
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5 mt-3">
            <button onClick={() => setShowObjModal(1)} className="flex items-center gap-1.5 text-[11px] text-okr-mi hover:text-okr-dk transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#005216]" />
              Obj 1 — Confiabilidade ({obj1Actions})
            </button>
            <button onClick={() => setShowObjModal(2)} className="flex items-center gap-1.5 text-[11px] text-okr-mi hover:text-okr-dk transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2ea043]" />
              Obj 2 — Experiência ({obj2Actions})
            </button>
          </div>
        </div>
      </div>

      {/* Objective detail modal on donut click */}
      {showObjModal && (
        <ObjDetailModal objNum={showObjModal} onClose={() => setShowObjModal(null)} actionStates={actionStates} chipStates={chipStates} />
      )}
    </>
  );
};

const ObjDetailModal: React.FC<{ objNum: number; onClose: () => void; actionStates: Record<string, boolean>; chipStates: Record<string, boolean> }> = ({ objNum, onClose, actionStates, chipStates }) => {
  const obj = OBJETIVOS.find(o => o.num === objNum)!;
  const objKrs = KRS.filter(kr => obj.krs.includes(kr.key));

  return (
    <Modal open={true} onClose={onClose} title={`Objetivo ${obj.num}`} maxWidth="600px">
      <p className="text-sm font-semibold text-okr-dk mb-4">{obj.name}</p>
      <div className="space-y-4">
        {objKrs.map(kr => {
          const p = calcProgressByKr(kr.key, actionStates, chipStates);
          const areas = [...new Set(ACTIONS.filter(a => a.kr === kr.key && !a.sub).map(a => a.area))];
          return (
            <div key={kr.key} className="border border-okr-bl rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-okr-dk text-[#a8e89c] text-[10px] font-medium px-2.5 py-0.5 rounded-full">{kr.name}</span>
                <span className="text-lg text-okr-dk">{p.percent}%</span>
              </div>
              <p className="text-[13px] text-okr-dk font-medium mb-1">{kr.fullName}</p>
              <ProgressBar percent={p.percent} fillColor="#005216" />
              <p className="text-[11px] text-okr-lt mt-2">{p.actionDone} de {p.actionCount} ações concluídas</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {areas.map(aKey => {
                  const a = AREAS.find(x => x.key === aKey)!;
                  return (
                    <span key={aKey} className="inline-flex items-center gap-1 text-[10px] text-okr-mi">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                      {a.name}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default OkrCharts;
