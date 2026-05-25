# Simulador de Depreciación TI — EDO

Web App para modelar la depreciación de activos tecnológicos mediante Ecuaciones Diferenciales Ordinarias de 1° y 2° orden.

**Autor:** Juan Camilo García Martín — UCompensar, Ingeniería de Software

---

## Modelos matemáticos implementados

### EDO de 1° Orden (Actividad 1)
```
dV/dt = −k · V(t)   →   V(t) = V₀ · e^(−kt)
```
- `V₀`: valor inicial del activo
- `k`: constante de depreciación anual (k=0.35 para hardware TI)

### EDO de 2° Orden (Actividad 2)
```
a·V''(t) + b·V'(t) + c·V(t) = 0
```
Parámetros del paper (rack de servidores IA, $120k USD):
- `a=1` (inercia tecnológica), `b=5` (amortiguación técnica), `c=6` (elasticidad de obsolescencia)
- Condiciones iniciales: V(0)=120, V'(0)=−20
- **Solución particular:** `V(t) = 340e^(−2t) − 220e^(−3t)`
- Sistema **sobreamortiguado** (Δ = b²−4ac = 1 > 0)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS |
| Gráficos | Recharts |
| Backend | Vercel Serverless Functions (`api/solve.ts`) |

---

## Instalación local

```bash
npm install
npm run dev
```

La app corre en `http://localhost:5173`.

## Despliegue en Vercel

```bash
# Opción 1: CLI de Vercel
npm i -g vercel
vercel

# Opción 2: conectar el repositorio en vercel.com
# → Import Git Repository → configuración automática detecta Vite
```

---

## Endpoint API

**`POST /api/solve`**

### Modelo de 1° orden
```json
{
  "model": "first-order",
  "V0": 120000,
  "k": 0.35,
  "years": 10
}
```

### Modelo de 2° orden
```json
{
  "model": "second-order",
  "V0": 120,
  "dV0": -20,
  "a": 1,
  "b": 5,
  "c": 6,
  "years": 6
}
```

### Respuesta
```json
{
  "points": [{ "t": 0, "V": 120, "dV": -20, "d2V": 40 }, ...],
  "model": "second-order",
  "roots": "r₁ = -2.0000, r₂ = -3.0000",
  "discriminant": 1,
  "systemType": "overdamped",
  "equation": "1V''(t) + 5V'(t) + 6V(t) = 0",
  "solution": "V(t) = 340.00·e^(-2.0000t) + -220.00·e^(-3.0000t)",
  "replacementYear": 3.21
}
```

---

## Estructura del proyecto

```
simulador-depreciacion/
├── api/
│   └── solve.ts              # Serverless function (Vercel)
├── src/
│   ├── App.tsx               # Layout principal
│   ├── main.tsx
│   ├── index.css
│   ├── components/
│   │   ├── ParameterForm.tsx # Formulario de parámetros
│   │   └── DepreciationChart.tsx  # Gráficas con Recharts
│   └── utils/
│       └── math-solver.ts    # Núcleo matemático (EDO solver)
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── vercel.json
└── package.json
```
