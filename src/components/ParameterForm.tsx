import { useState } from 'react';

export type ModelType = 'first-order' | 'second-order';

export interface FirstOrderState {
  V0: number;
  k: number;
  years: number;
}

export interface SecondOrderState {
  V0: number;
  dV0: number;
  a: number;
  b: number;
  c: number;
  years: number;
}

interface Props {
  onSolve: (model: ModelType, params: FirstOrderState | SecondOrderState) => void;
  loading: boolean;
}

export default function ParameterForm({ onSolve, loading }: Props) {
  const [model, setModel] = useState<ModelType>('second-order');

  const [fo, setFo] = useState<FirstOrderState>({ V0: 120000, k: 0.35, years: 10 });
  const [so, setSo] = useState<SecondOrderState>({ V0: 120, dV0: -20, a: 1, b: 5, c: 6, years: 6 });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSolve(model, model === 'first-order' ? fo : so);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Modelo EDO</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setModel('second-order')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              model === 'second-order'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            2° Orden (Act. 2)
          </button>
          <button
            type="button"
            onClick={() => setModel('first-order')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              model === 'first-order'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            1° Orden (Act. 1)
          </button>
        </div>
      </div>

      {model === 'first-order' ? (
        <div className="space-y-4">
          <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 font-mono">
            dV/dt = −k · V(t) → V(t) = V₀ · e^(−kt)
          </p>
          <Field label="Valor inicial V₀ (USD)" value={fo.V0} onChange={v => setFo({ ...fo, V0: v })} min={1} step={1000} />
          <Field label="Constante de depreciación k" value={fo.k} onChange={v => setFo({ ...fo, k: v })} min={0.01} step={0.01} max={2} />
          <Field label="Horizonte temporal (años)" value={fo.years} onChange={v => setFo({ ...fo, years: v })} min={1} step={1} max={30} />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 font-mono">
            a·V''(t) + b·V'(t) + c·V(t) = 0
          </p>
          <div className="grid grid-cols-3 gap-3">
            <SmallField label="a (inercia)" value={so.a} onChange={v => setSo({ ...so, a: v })} step={0.1} />
            <SmallField label="b (amort.)" value={so.b} onChange={v => setSo({ ...so, b: v })} step={0.1} />
            <SmallField label="c (obsolesc.)" value={so.c} onChange={v => setSo({ ...so, c: v })} step={0.1} />
          </div>
          <Field label="V(0) — Valor inicial (miles USD)" value={so.V0} onChange={v => setSo({ ...so, V0: v })} min={1} step={10} />
          <Field label="V'(0) — Tasa inicial de depreciación" value={so.dV0} onChange={v => setSo({ ...so, dV0: v })} step={1} allowNegative />
          <Field label="Horizonte temporal (años)" value={so.years} onChange={v => setSo({ ...so, years: v })} min={1} step={1} max={20} />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        {loading ? 'Calculando…' : 'Calcular'}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  allowNegative?: boolean;
}

function Field({ label, value, onChange, min, max, step = 1, allowNegative }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={allowNegative ? undefined : min}
        max={max}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}

function SmallField({ label, value, onChange, step = 1 }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );
}
