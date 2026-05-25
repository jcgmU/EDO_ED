import { useState } from 'react';
import ParameterForm, { type ModelType, type FirstOrderState, type SecondOrderState } from './components/ParameterForm';
import DepreciationChart from './components/DepreciationChart';
import { solveFirstOrder, solveSecondOrder, type SolveResult } from './utils/math-solver';

export default function App() {
  const [result, setResult] = useState<SolveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSolve(model: ModelType, params: FirstOrderState | SecondOrderState) {
    setLoading(true);
    setError(null);
    try {
      let res: SolveResult;
      if (model === 'first-order') {
        res = solveFirstOrder(params as FirstOrderState);
      } else {
        res = solveSecondOrder(params as SecondOrderState);
      }
      setResult(res);
    } catch (e) {
      setError('Error al resolver la EDO. Verifica los parámetros.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            Simulador de Depreciación TI
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Modelado dinámico mediante EDO de 1° y 2° orden — UCompensar, Ingeniería de Software
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1">
            <ParameterForm onSolve={handleSolve} loading={loading} />

            <div className="mt-5 bg-white rounded-2xl shadow-md p-5 text-xs text-gray-500 space-y-2">
              <p className="font-semibold text-gray-700 text-sm">Referencia académica</p>
              <p><span className="font-medium">1° Orden:</span> dV/dt = −k·V(t)<br />V(t) = V₀·e^(−kt)</p>
              <p><span className="font-medium">2° Orden:</span> aV'' + bV' + cV = 0<br />
                Valores del paper: a=1, b=5, c=6<br />
                V(0)=120 (miles USD), V'(0)=−20<br />
                <span className="text-indigo-600 font-mono">V(t) = 340e^(−2t) − 220e^(−3t)</span>
              </p>
            </div>
          </aside>

          <section className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-4">
                {error}
              </div>
            )}
            {result ? (
              <DepreciationChart result={result} />
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-md h-96 flex flex-col items-center justify-center text-gray-400 space-y-3">
      <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
      <p className="text-sm font-medium">Configura los parámetros y presiona <span className="text-indigo-500">Calcular</span></p>
    </div>
  );
}
