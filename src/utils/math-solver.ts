export interface DataPoint {
  t: number;
  V: number;
  dV: number;
  d2V: number;
}

export interface SolveResult {
  points: DataPoint[];
  model: 'first-order' | 'second-order';
  roots: string;
  discriminant?: number;
  systemType?: 'overdamped' | 'critically-damped' | 'underdamped';
  equation: string;
  solution: string;
  replacementYear: number | null;
}

export interface FirstOrderParams {
  V0: number;
  k: number;
  years: number;
}

export interface SecondOrderParams {
  V0: number;
  dV0: number;
  a: number;
  b: number;
  c: number;
  years: number;
}

export function solveFirstOrder(params: FirstOrderParams): SolveResult {
  const { V0, k, years } = params;
  const steps = years * 24;
  const dt = years / steps;
  const points: DataPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = parseFloat((i * dt).toFixed(4));
    const V = V0 * Math.exp(-k * t);
    const dV = -k * V;
    const d2V = k * k * V;
    points.push({ t, V: parseFloat(V.toFixed(4)), dV: parseFloat(dV.toFixed(4)), d2V: parseFloat(d2V.toFixed(4)) });
  }

  // Replacement point: when V drops below 10% of V0
  const threshold = V0 * 0.1;
  const replacementPoint = points.find(p => p.V <= threshold);

  return {
    points,
    model: 'first-order',
    roots: `r = -${k}`,
    equation: `dV/dt = -${k}·V(t)`,
    solution: `V(t) = ${V0}·e^(-${k}t)`,
    replacementYear: replacementPoint ? parseFloat(replacementPoint.t.toFixed(2)) : null,
  };
}

export function solveSecondOrder(params: SecondOrderParams): SolveResult {
  const { V0, dV0, a, b, c, years } = params;
  const steps = years * 24;
  const dt = years / steps;

  const discriminant = b * b - 4 * a * c;
  let C1: number, C2: number;
  let systemType: 'overdamped' | 'critically-damped' | 'underdamped';
  let rootsStr: string;
  let solutionStr: string;

  const points: DataPoint[] = [];

  if (Math.abs(discriminant) < 1e-10) {
    // Critically damped: one repeated real root
    systemType = 'critically-damped';
    const r = -b / (2 * a);
    C1 = V0;
    C2 = dV0 - r * V0;
    rootsStr = `r₁ = r₂ = ${r.toFixed(4)}`;
    solutionStr = `V(t) = (${C1.toFixed(2)} + ${C2.toFixed(2)}t)·e^(${r.toFixed(4)}t)`;

    for (let i = 0; i <= steps; i++) {
      const t = parseFloat((i * dt).toFixed(4));
      const V = (C1 + C2 * t) * Math.exp(r * t);
      const dV = (C2 + r * (C1 + C2 * t)) * Math.exp(r * t);
      const d2V = (2 * r * C2 + r * r * (C1 + C2 * t)) * Math.exp(r * t);
      points.push({ t, V: parseFloat(V.toFixed(4)), dV: parseFloat(dV.toFixed(4)), d2V: parseFloat(d2V.toFixed(4)) });
    }
  } else if (discriminant > 0) {
    // Overdamped: two distinct real roots
    systemType = 'overdamped';
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    // V(0)=C1+C2=V0, V'(0)=r1*C1+r2*C2=dV0
    C1 = (dV0 - r2 * V0) / (r1 - r2);
    C2 = V0 - C1;
    rootsStr = `r₁ = ${r1.toFixed(4)}, r₂ = ${r2.toFixed(4)}`;
    solutionStr = `V(t) = ${C1.toFixed(2)}·e^(${r1.toFixed(4)}t) + ${C2.toFixed(2)}·e^(${r2.toFixed(4)}t)`;

    for (let i = 0; i <= steps; i++) {
      const t = parseFloat((i * dt).toFixed(4));
      const V = C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
      const dV = C1 * r1 * Math.exp(r1 * t) + C2 * r2 * Math.exp(r2 * t);
      const d2V = C1 * r1 * r1 * Math.exp(r1 * t) + C2 * r2 * r2 * Math.exp(r2 * t);
      points.push({ t, V: parseFloat(V.toFixed(4)), dV: parseFloat(dV.toFixed(4)), d2V: parseFloat(d2V.toFixed(4)) });
    }
  } else {
    // Underdamped: complex conjugate roots
    systemType = 'underdamped';
    const alpha = -b / (2 * a);
    const beta = Math.sqrt(-discriminant) / (2 * a);
    C1 = V0;
    C2 = (dV0 - alpha * V0) / beta;
    rootsStr = `r = ${alpha.toFixed(4)} ± ${beta.toFixed(4)}i`;
    solutionStr = `V(t) = e^(${alpha.toFixed(4)}t)·[${C1.toFixed(2)}cos(${beta.toFixed(4)}t) + ${C2.toFixed(2)}sin(${beta.toFixed(4)}t)]`;

    for (let i = 0; i <= steps; i++) {
      const t = parseFloat((i * dt).toFixed(4));
      const envelope = Math.exp(alpha * t);
      const V = envelope * (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t));
      const dVInner = -C1 * beta * Math.sin(beta * t) + C2 * beta * Math.cos(beta * t);
      const dV = alpha * envelope * (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t)) + envelope * dVInner;
      // Approximate d2V numerically for display
      const d2V = (alpha * alpha - beta * beta) * envelope * (C1 * Math.cos(beta * t) + C2 * Math.sin(beta * t))
        + 2 * alpha * envelope * dVInner;
      points.push({ t, V: parseFloat(V.toFixed(4)), dV: parseFloat(dV.toFixed(4)), d2V: parseFloat(d2V.toFixed(4)) });
    }
  }

  // Replacement point: when depreciation rate dominates value (|dV/dt| > V or V drops below 10% V0)
  const threshold = V0 * 0.1;
  const replacementPoint = points.find(p => p.V > 0 && p.V <= threshold);

  return {
    points,
    model: 'second-order',
    roots: rootsStr,
    discriminant,
    systemType,
    equation: `${a}V''(t) + ${b}V'(t) + ${c}V(t) = 0`,
    solution: solutionStr,
    replacementYear: replacementPoint ? parseFloat(replacementPoint.t.toFixed(2)) : null,
  };
}
