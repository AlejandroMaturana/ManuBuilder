# ManuBuilder

ERP para constructor independiente — gestión de proyectos, costos, rentabilidad y stock.

## Estructura del proyecto

```
ManuBuilder/
├── backend/      → API REST (Node.js · Express · Sequelize · PostgreSQL)
├── frontend/     → SPA (React · Vite)
├── docs/         → Documentación técnica
└── README.md     ← este archivo
```

## Cómo levantar

```bash
# Terminal 1 — Backend (API en :3131)
cd backend
pnpm run dev

# Terminal 2 — Frontend (UI en :5175)
cd frontend
pnpm run dev
```

Luego abre **http://localhost:5175** en el navegador.

## Links rápidos

- [Arquitectura técnica](docs/ARQUITECTURA.md)
- [Documentación completa](docs/README.md)
- [Backend — package.json](backend/package.json)
- [Frontend — package.json](frontend/package.json)

## Stack

| Capa | Tecnología |
|---|---|
| API | Node.js + Express + Sequelize |
| Base de datos | PostgreSQL |
| Frontend | React 19 + Vite 8 |
| Estilos | CSS vanilla (dark mode) |
| Gráficas | Recharts |

## Licencia

MIT
