import { useEffect, useState } from 'react';
import { getDashboard, fmt, fmtPct, colorMargen } from '../api';
import KpiCard from '../components/KpiCard';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLOR_MAP = { green: '#30d68c', amber: '#f5a623', red: '#ff5b7a' };

export default function Dashboard() {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  if (error) return (
    <div className="empty-state">
      <div className="empty-icon">⚠️</div>
      <p style={{ color: 'var(--red)' }}>Error: {error}</p>
      <p style={{ marginTop: 8 }}>Verifica que la base de datos esté conectada.</p>
    </div>
  );

  if (!data) return <div className="loading-center"><div className="spinner" /></div>;

  const { totales, proyectos } = data;
  const margenGlobal = totales.presupuestado > 0
    ? ((totales.rentabilidad / totales.presupuestado) * 100).toFixed(1)
    : 0;
  const colorGlobal = colorMargen(margenGlobal);

  const chartData = proyectos.map(p => ({
    name: p.nombre.length > 16 ? p.nombre.slice(0, 14) + '…' : p.nombre,
    Presupuesto: p.presupuesto.total,
    'Costo Real': p.real.total,
    color: COLOR_MAP[colorMargen(p.indicadores.margenPct)],
  }));

  const enRojo  = proyectos.filter(p => p.indicadores.estaEnRojo).length;
  const activos = proyectos.length;

  return (
    <div className="animate-in">
      {/* KPIs globales */}
      <div className="kpi-grid">
        <KpiCard
          label="Presupuesto Total"
          value={fmt(totales.presupuestado)}
          sub={`${activos} proyecto${activos !== 1 ? 's' : ''} activos`}
          color="blue"
          icon="💰"
        />
        <KpiCard
          label="Costo Real Total"
          value={fmt(totales.costoReal)}
          sub="Suma de HH + materiales + gastos"
          color="amber"
          icon="📉"
        />
        <KpiCard
          label="Rentabilidad Global"
          value={fmt(totales.rentabilidad)}
          sub={`Margen: ${fmtPct(margenGlobal)}`}
          color={colorGlobal}
          icon="📈"
        />
        <KpiCard
          label="Proyectos en Rojo"
          value={enRojo}
          sub={`de ${activos} proyecto${activos !== 1 ? 's' : ''}`}
          color={enRojo > 0 ? 'red' : 'green'}
          icon="🚨"
        />
      </div>

      {/* Gráfico presupuesto vs real */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">📊 Presupuesto vs Costo Real por Proyecto</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8b90a7' }} />
              <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#8b90a7' }} />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{ background: '#1a1e2b', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}
                labelStyle={{ color: '#f0f2f8' }}
              />
              <Bar dataKey="Presupuesto" fill="#6c8aff" radius={[4,4,0,0]} />
              <Bar dataKey="Costo Real" radius={[4,4,0,0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lista proyectos con semáforo */}
      <div className="section-title">🏗️ Estado de Proyectos</div>
      {proyectos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <p>No hay proyectos activos aún.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Estado</th>
                <th>Presupuesto</th>
                <th>Costo Real</th>
                <th>Rentabilidad</th>
                <th>Margen %</th>
                <th>HH %</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map(p => {
                const color = colorMargen(p.indicadores.margenPct);
                return (
                  <tr
                    key={p.proyectoId}
                    style={{ cursor: 'pointer' }}
                    onClick={() => nav(`/proyectos/${p.proyectoId}`)}
                  >
                    <td style={{ fontWeight: 700 }}>{p.nombre}</td>
                    <td>
                      <span className={`badge badge-${p.estado === 'activo' ? 'green' : p.estado === 'pausado' ? 'amber' : 'neutral'}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td>{fmt(p.presupuesto.total)}</td>
                    <td>{fmt(p.real.total)}</td>
                    <td style={{ color: `var(--${color})`, fontWeight: 700 }}>
                      {fmt(p.indicadores.rentabilidad)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1, minWidth: 60 }}>
                          <div
                            className={`progress-fill ${color}`}
                            style={{ width: `${Math.min(100, Math.max(0, p.indicadores.margenPct))}%` }}
                          />
                        </div>
                        <span style={{ color: `var(--${color})`, fontWeight: 700, minWidth: 40 }}>
                          {fmtPct(p.indicadores.margenPct)}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {fmtPct(p.indicadores.avanceHHPct)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
