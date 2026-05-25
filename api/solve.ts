import type { IncomingMessage, ServerResponse } from 'http';
import { solveFirstOrder, solveSecondOrder } from '../src/utils/math-solver';

interface Req extends IncomingMessage {
  body: Record<string, unknown>;
}

export default function handler(req: Req, res: ServerResponse & { status: (c: number) => typeof res; json: (b: unknown) => void }) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body;
    const model = body.model as string;

    if (model === 'first-order') {
      const V0 = Number(body.V0);
      const k = Number(body.k);
      const years = Number(body.years);

      if (isNaN(V0) || isNaN(k) || isNaN(years) || V0 <= 0 || k <= 0 || years <= 0) {
        res.status(400).json({ error: 'Parámetros inválidos' });
        return;
      }

      res.status(200).json(solveFirstOrder({ V0, k, years }));
      return;
    }

    if (model === 'second-order') {
      const V0 = Number(body.V0);
      const dV0 = Number(body.dV0);
      const a = Number(body.a);
      const b = Number(body.b);
      const c = Number(body.c);
      const years = Number(body.years);

      if ([V0, dV0, a, b, c, years].some(isNaN) || V0 <= 0 || a === 0 || years <= 0) {
        res.status(400).json({ error: 'Parámetros inválidos' });
        return;
      }

      res.status(200).json(solveSecondOrder({ V0, dV0, a, b, c, years }));
      return;
    }

    res.status(400).json({ error: 'Modelo desconocido. Use "first-order" o "second-order"' });
  } catch {
    res.status(500).json({ error: 'Error interno al resolver la EDO' });
  }
}
