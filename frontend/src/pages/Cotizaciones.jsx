import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCotizaciones, getConfiguracion, fmt } from '../api';

const ESTADO_BADGE = {
  borrador:  'badge-neutral',
  enviada:   'badge-blue',
  aprobada:  'badge-green',
  rechazada: 'badge-red',
  vencida:   'badge-amber',
};

export default function Cotizaciones() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCotizaciones()
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h2>📄 Cotizaciones</h2>
          <p style={{ color: 'var(--text-muted)' }}>{list.length} cotización{list.length !== 1 ? 'es' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => nav('/cotizaciones/nueva')}>＋ Nueva Cotización</button>
      </div>

      {list.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📄</div><p>Sin cotizaciones aún.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Obra</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Emisión</th>
                <th>Vencimiento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.correlativo}</td>
                  <td style={{ fontWeight: 500 }}>{c.clienteNombre || '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.descripcionObra?.substring(0, 50) || '—'}
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmt(c.total)}</td>
                  <td><span className={`badge ${ESTADO_BADGE[c.estado] || 'badge-neutral'}`}>{c.estado}</span></td>
                  <td>{c.fechaEmision}</td>
                  <td>{c.fechaVencimiento}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => nav(`/cotizaciones/${c.id}`)}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
