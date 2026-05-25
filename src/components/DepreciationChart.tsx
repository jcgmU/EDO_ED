import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { InlineMath } from 'react-katex';
import type { SolveResult } from '../utils/math-solver';

interface Props {
  result: SolveResult;
}

const SYSTEM_LABELS: Record<string, string> = {
  overdamped: 'Sobreamortiguado',
  'critically-damped': 'Críticamente amortiguado',
  underdamped: 'Subamortiguado',
};

const SYSTEM_COLORS: Record<string, string> = {
  overdamped: 'text-green-600 bg-green-50',
  'critically-damped': 'text-yellow-600 bg-yellow-50',
  underdamped: 'text-red-600 bg-red-50',
};

export default function DepreciationChart({ result }: Props) {
  const { points, equation, solution, roots, discriminant, systemType, replacementYear } = result;

  // Downsample for chart performance
  const step = Math.max(1, Math.floor(points.length / 200));
  const chartData = points.filter((_, i) => i % step === 0);

  const maxV = Math.max(...points.map(p => p.V));
  const minV = Math.min(...points.map(p => p.V));

  return (
    <div className="space-y-6">
      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KatexCard title="Ecuación del sistema" math={equationToLatex(equation)} />
        <KatexCard title="Solución particular" math={solutionToLatex(solution)} />
        <KatexCard title="Raíces características" math={rootsToLatex(roots)} />
        {discriminant !== undefined && (
          <KatexCard title="Discriminante" math={`\\Delta = b^2 - 4ac = ${discriminant.toFixed(4)}`} />
        )}
        {systemType && (
          <div className={`rounded-xl px-4 py-3 ${SYSTEM_COLORS[systemType]}`}>
            <p className="text-xs font-medium opacity-70">Tipo de sistema</p>
            <p className="font-semibold">{SYSTEM_LABELS[systemType]}</p>
          </div>
        )}
        {replacementYear !== null && (
          <div className="rounded-xl px-4 py-3 bg-orange-50 text-orange-700">
            <p className="text-xs font-medium opacity-70">Punto de reemplazo recomendado</p>
            <p className="font-semibold flex items-center gap-1">
              <InlineMath math={`t \\approx ${replacementYear}`} /> años <span className="text-sm">(V ≤ 10% V₀)</span>
            </p>
          </div>
        )}
      </div>

      {/* Main chart: V(t) */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Valor del activo V(t)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="t" label={{ value: 'Tiempo (años)', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
            <YAxis
              domain={[Math.min(0, minV - 5), maxV * 1.05]}
              tickFormatter={v => v.toFixed(0)}
              tick={{ fontSize: 11 }}
              label={{ value: 'Valor (miles USD)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)}`, '']}
              labelFormatter={t => `t = ${t} años`}
            />
            <Legend />
            {replacementYear !== null && (
              <ReferenceLine x={replacementYear} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Reemplazo', fontSize: 10, fill: '#f97316' }} />
            )}
            <Line type="monotone" dataKey="V" name="V(t) — Valor" stroke="#6366f1" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Derivative chart: V'(t) and V''(t) */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Velocidad V'(t) y Aceleración V''(t) de depreciación</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="t" label={{ value: 'Tiempo (años)', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => v.toFixed(1)} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(4)}`, '']}
              labelFormatter={t => `t = ${t} años`}
            />
            <Legend />
            <Line type="monotone" dataKey="dV" name="V'(t) — Velocidad" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="d2V" name="V''(t) — Aceleración" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KatexCard({ title, math }: { title: string; math: string }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 overflow-x-auto">
      <p className="text-xs font-medium text-gray-400 mb-1">{title}</p>
      <InlineMath math={math} />
    </div>
  );
}

// Convert solver output strings to LaTeX
function equationToLatex(eq: string): string {
  return eq
    .replace(/V''/g, "V''")
    .replace(/V'/g, "V'")
    .replace(/\*/g, '\\cdot ')
    .replace(/(\d+)V''\(t\)/g, '$1V\'\'(t)')
    .replace(/(\d+)V'\(t\)/g, '$1V\'(t)')
    .replace(/(\d+)V\(t\)/g, '$1V(t)')
    .replace('= 0', '= 0');
}

function solutionToLatex(sol: string): string {
  // e^(Xt) → e^{Xt}, e^(-2t) → e^{-2t}
  return sol
    .replace(/e\^\(([^)]+)\)/g, 'e^{$1}')
    .replace(/·/g, '\\cdot ')
    .replace(/\*/g, '\\cdot ');
}

function rootsToLatex(roots: string): string {
  return roots
    .replace(/r₁/g, 'r_1')
    .replace(/r₂/g, 'r_2')
    .replace(/±/g, '\\pm ')
    .replace(/(\d+\.\d+)i/g, '$1i');
}
