import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProyecto, getRentabilidad, getRegistros, getPartidas, getOficios,
  deleteRegistro, createPartida, updatePartida, deletePartida, updateRegistro,
  fmt, fmtPct, colorMargen, estadoBadge
} from '../api';
import KpiCard from '../components/KpiCard';
import RegistroRapido from '../components/RegistroRapido';
import TarjetaJornada from '../components/TarjetaJornada';
import Modal from '../components/Modal';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TIPO_COLOR = { hh: '#6c8aff', material: '#f5a623', gasto: '#ff5b7a' };

export default function ProyectoDetalle() {
  const { id } = useParams();
  const nav = useNavigate();

  const [proyecto,      setProyecto]      = useState(null);
  const [rentabilidad,  setRentabilidad]  = useState(null);
  const [registros,     setRegistros]     = useState([]);
  const [partidas,      setPartidas]      = useState([]);
  const [oficios,       setOficios]       = useState([]);
  const [tab,           setTab]           = useState('resumen');
  const [loading,       setLoading]       = useState(true);

  // Modal nueva partida
  const [modalPartida, setModalPartida] = useState(false);
  const [pForm, setPForm] = useState({ nombre: '', hhPresupuestadas: '', costoPresupuestado: '', orden: '', oficioId: '' });
  const [pSaving, setPSaving] = useState(false);

  // Modal editar partida
  const [editingPartida, setEditingPartida] = useState(null);

  // Modal editar registro
  const [editRegistro, setEditRegistro] = useState(null);
  const [rForm, setRForm] = useState({ tipo: 'hh', descripcion: '', cantidad: '', unidad: 'hr', costoUnitario: '', fecha: '', partidaId: '' });
  const [rSaving, setRSaving] = useState(false);

  // Toggle modo registro: 'rapido' | 'jornada'
  const [modoRegistro, setModoRegistro] = useState('rapido');

  const load = useCallback(async () => {
    setLoading(true);
    const [p, r, regs, parts, offs] = await Promise.all([
      getProyecto(id),
      getRentabilidad(id).catch(() => null),
      getRegistros({ proyectoId: id }),
      getPartidas(id),
      getOficios(),
    ]);
    setProyecto(p);
    setRentabilidad(r);
    setRegistros(regs);
    setPartidas(parts);
    setOficios(offs);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleDeleteRegistro(regId) {
    if (!confirm('¿Eliminar este registro?')) return;
    await deleteRegistro(regId);
    load();
  }

  async function handleDeletePartida(pId) {
    if (!confirm('¿Eliminar esta partida?')) return;
    await deletePartida(pId);
    load();
  }

  async function handleSavePartida() {
    if (!pForm.nombre.trim()) return;
    setPSaving(true);
    const data = { ...pForm, hhPresupuestadas: parseFloat(pForm.hhPresupuestadas) || 0, costoPresupuestado: parseFloat(pForm.costoPresupuestado) || 0, orden: parseInt(pForm.orden) || 0, oficioId: pForm.oficioId || null };
    if (editingPartida) {
      await updatePartida(editingPartida.id, data);
    } else {
      await createPartida(id, data);
    }
    setModalPartida(false);
    setEditingPartida(null);
    setPForm({ nombre: '', hhPresupuestadas: '', costoPresupuestado: '', orden: '', oficioId: '' });
    setPSaving(false);
    load();
  }

  function handleEditPartida(p) {
    setPForm({
      nombre: p.nombre,
      hhPresupuestadas: p.hhPresupuestadas?.toString() || '',
      costoPresupuestado: p.costoPresupuestado?.toString() || '',
      orden: p.orden?.toString() || '',
      oficioId: p.oficioId?.toString() || '',
    });
    setEditingPartida(p);
    setModalPartida(true);
  }

  function handleEditRegistro(r) {
    setRForm({
      tipo: r.tipo,
      descripcion: r.descripcion,
      cantidad: r.cantidad?.toString() || '',
      unidad: r.unidad || 'hr',
      costoUnitario: r.costoUnitario?.toString() || '',
      fecha: r.fecha || '',
      partidaId: r.partidaId?.toString() || '',
    });
    setEditRegistro(r);
  }

  async function handleUpdateRegistro() {
    if (!rForm.descripcion || !rForm.cantidad) return;
    setRSaving(true);
    await updateRegistro(editRegistro.id, {
      ...rForm,
      proyectoId: id,
      costoTotal: (parseFloat(rForm.cantidad) || 0) * (parseFloat(rForm.costoUnitario) || 0),
      cantidad: parseFloat(rForm.cantidad),
      costoUnitario: parseFloat(rForm.costoUnitario) || 0,
    });
    setEditRegistro(null);
    setRForm({ tipo: 'hh', descripcion: '', cantidad: '', unidad: 'hr', costoUnitario: '', fecha: '', partidaId: '' });
    setRSaving(false);
    load();
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!proyecto) return <div className="empty-state"><p>Proyecto no encontrado.</p></div>;

  const color = rentabilidad ? colorMargen(rentabilidad.indicadores.margenPct) : 'blue';

  // Datos para pie chart
  const pieData = rentabilidad ? [
    { name: 'HH',        value: rentabilidad.real.hh,          color: TIPO_COLOR.hh },
    { name: 'Materiales',value: rentabilidad.real.materiales,   color: TIPO_COLOR.material },
    { name: 'Gastos',    value: rentabilidad.real.gastos,       color: TIPO_COLOR.gasto },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/proyectos')} style={{ marginBottom: 8 }}>
            ← Volver
          </button>
          <h2>{proyecto.nombre}</h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className={`badge ${estadoBadge(proyecto.estado)}`}>{proyecto.estado}</span>
            {proyecto.cliente && <span style={{ color: 'var(--text-muted)' }}>· {proyecto.cliente.nombre}</span>}
            {proyecto.fechaInicio && <span style={{ color: 'var(--text-muted)' }}>· Inicio: {proyecto.fechaInicio}</span>}
          </p>
        </div>
      </div>

      {/* KPIs */}
      {rentabilidad && (
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          <KpiCard label="Presupuesto" value={fmt(rentabilidad.presupuesto.total)} color="blue" icon="💰" />
          <KpiCard label="Costo Real" value={fmt(rentabilidad.real.total)} color="amber" icon="📉" sub={`HH: ${fmt(rentabilidad.real.hh)}`} />
          <KpiCard
            label="Rentabilidad"
            value={fmt(rentabilidad.indicadores.rentabilidad)}
            color={color}
            icon={rentabilidad.indicadores.estaEnRojo ? '🔴' : '✅'}
            sub={`Margen: ${fmtPct(rentabilidad.indicadores.margenPct)}`}
          />
          <KpiCard
            label="Valor Sugerido"
            value={fmt(rentabilidad.indicadores.valorSugerido)}
            color="blue"
            icon="💡"
            sub="Con 30% margen"
          />
          <KpiCard
            label="Avance HH"
            value={fmtPct(rentabilidad.indicadores.avanceHHPct)}
            color={rentabilidad.indicadores.avanceHHPct > 100 ? 'red' : 'green'}
            icon="⏱️"
            sub={`${rentabilidad.real.hhHoras?.toFixed(1)} / ${rentabilidad.presupuesto.hh} hrs`}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {['resumen','registros','partidas'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'resumen' ? '📊 Resumen' : t === 'registros' ? '📋 Registros' : '🗂️ Partidas'}
          </button>
        ))}
      </div>

      {/* ─── TAB RESUMEN ─── */}
      {tab === 'resumen' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Registro:</span>
            <div className="tabs" style={{ marginBottom: 0 }}>
              <button className={`tab ${modoRegistro === 'rapido' ? 'active' : ''}`} onClick={() => setModoRegistro('rapido')}>⚡ Captura Rápida</button>
              <button className={`tab ${modoRegistro === 'jornada' ? 'active' : ''}`} onClick={() => setModoRegistro('jornada')}>📋 Tarjeta de Jornada</button>
            </div>
          </div>
          {modoRegistro === 'rapido' ? (
            <RegistroRapido proyectoId={id} partidas={partidas} onSuccess={load} />
          ) : (
            <TarjetaJornada proyectoId={id} partidas={partidas} onSuccess={load} />
          )}

          {rentabilidad && pieData.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="section-title">🍩 Distribución del Costo Real</div>
              <div className="two-col" style={{ alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#1a1e2b', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div>
                  {pieData.map(d => (
                    <div key={d.name} className="stat-block" style={{ marginBottom: 10 }}>
                      <div className="stat-label" style={{ color: d.color }}>{d.name}</div>
                      <div className="stat-val" style={{ color: d.color }}>{fmt(d.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── TAB REGISTROS ─── */}
      {tab === 'registros' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Registro:</span>
            <div className="tabs" style={{ marginBottom: 0 }}>
              <button className={`tab ${modoRegistro === 'rapido' ? 'active' : ''}`} onClick={() => setModoRegistro('rapido')}>⚡ Captura Rápida</button>
              <button className={`tab ${modoRegistro === 'jornada' ? 'active' : ''}`} onClick={() => setModoRegistro('jornada')}>📋 Tarjeta de Jornada</button>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            {modoRegistro === 'rapido' ? (
              <RegistroRapido proyectoId={id} partidas={partidas} onSuccess={load} />
            ) : (
              <TarjetaJornada proyectoId={id} partidas={partidas} onSuccess={load} />
            )}
          </div>
          {registros.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><p>Sin registros aún.</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Costo Unit.</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map(r => (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{r.fecha}</td>
                      <td>
                        <span className={`badge ${r.tipo === 'hh' ? 'badge-blue' : r.tipo === 'material' ? 'badge-amber' : 'badge-red'}`}>
                          {r.tipo}
                        </span>
                      </td>
                      <td style={{ maxWidth: 200 }}>{r.descripcion}</td>
                      <td>{r.cantidad}</td>
                      <td>{r.unidad || '—'}</td>
                      <td>{r.costoUnitario ? fmt(r.costoUnitario) : '—'}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(r.costoTotal)}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditRegistro(r)} style={{ marginRight: 4 }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRegistro(r.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {editRegistro && (
            <Modal
              title="Editar Registro"
              onClose={() => { setEditRegistro(null); }}
              footer={
                <>
                  <button className="btn btn-ghost" onClick={() => setEditRegistro(null)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleUpdateRegistro} disabled={rSaving}>
                    {rSaving ? 'Guardando…' : 'Guardar Cambios'}
                  </button>
                </>
              }
            >
              <div className="form-group">
                <label>Tipo</label>
                <select className="form-control" value={rForm.tipo} onChange={e => setRForm(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="hh">hh</option>
                  <option value="material">material</option>
                  <option value="gasto">gasto</option>
                </select>
              </div>
              <div className="form-group">
                <label>Descripción *</label>
                <input className="form-control" value={rForm.descripcion} onChange={e => setRForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="ej: Colocación cerámica baño" required />
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label>Cantidad *</label>
                  <input type="number" step="0.001" className="form-control" value={rForm.cantidad} onChange={e => setRForm(f => ({ ...f, cantidad: e.target.value }))} placeholder="0" required />
                </div>
                <div className="form-group">
                  <label>Unidad</label>
                  <select className="form-control" value={rForm.unidad} onChange={e => setRForm(f => ({ ...f, unidad: e.target.value }))}>
                    <option value="hr">hr</option>
                    <option value="kg">kg</option>
                    <option value="m2">m2</option>
                    <option value="m3">m3</option>
                    <option value="ml">ml</option>
                    <option value="und">und</option>
                    <option value="gl">gl</option>
                    <option value="lt">lt</option>
                  </select>
                </div>
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label>Costo Unit. ($)</label>
                  <input type="number" step="1" className="form-control" value={rForm.costoUnitario} onChange={e => setRForm(f => ({ ...f, costoUnitario: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Partida</label>
                  <select className="form-control" value={rForm.partidaId} onChange={e => setRForm(f => ({ ...f, partidaId: e.target.value }))}>
                    <option value="">Sin partida</option>
                    {partidas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" className="form-control" value={rForm.fecha} onChange={e => setRForm(f => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Total</label>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green)', paddingBottom: '10px', display: 'block' }}>
                    {fmt((parseFloat(rForm.cantidad) || 0) * (parseFloat(rForm.costoUnitario) || 0))}
                  </span>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}

      {/* ─── TAB PARTIDAS ─── */}
      {tab === 'partidas' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button className="btn btn-primary" onClick={() => { setModalPartida(true); setEditingPartida(null); setPForm({ nombre: '', hhPresupuestadas: '', costoPresupuestado: '', orden: '', oficioId: '' }); }}>＋ Nueva Partida</button>
          </div>
          {partidas.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🗂️</div><p>Sin partidas definidas.</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Nombre</th>
                    <th>Oficio</th>
                    <th>HH Presup.</th>
                    <th>Costo Presup.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {partidas.map(p => (
                    <tr key={p.id}>
                      <td>{p.orden || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{p.nombre}</td>
                      <td>{p.oficio?.nombre || '—'}</td>
                      <td>{p.hhPresupuestadas} hr</td>
                      <td>{fmt(p.costoPresupuestado)}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditPartida(p)} style={{ marginRight: 4 }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeletePartida(p.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {modalPartida && (
            <Modal
              title={editingPartida ? 'Editar Partida' : 'Nueva Partida'}
              onClose={() => { setModalPartida(false); setEditingPartida(null); }}
              footer={
                <>
                  <button className="btn btn-ghost" onClick={() => { setModalPartida(false); setEditingPartida(null); }}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleSavePartida} disabled={pSaving}>
                    {pSaving ? 'Guardando…' : editingPartida ? 'Guardar Cambios' : 'Crear Partida'}
                  </button>
                </>
              }
            >
              <div className="form-group">
                <label>Nombre *</label>
                <input className="form-control" value={pForm.nombre} onChange={e => setPForm(f => ({ ...f, nombre: e.target.value }))} placeholder="ej: Tabiquería living" />
              </div>
              <div className="form-group">
                <label>Oficio *</label>
                <select className="form-control" value={pForm.oficioId} onChange={e => setPForm(f => ({ ...f, oficioId: e.target.value }))}>
                  <option value="">— Seleccionar oficio —</option>
                  {oficios.map(o => <option key={o.id} value={o.id}>{o.nombre} (${Number(o.valorHora).toLocaleString()}/hr)</option>)}
                </select>
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label>HH Presupuestadas</label>
                  <input type="number" className="form-control" value={pForm.hhPresupuestadas} onChange={e => setPForm(f => ({ ...f, hhPresupuestadas: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Costo Presupuestado ($)</label>
                  <input type="number" className="form-control" value={pForm.costoPresupuestado} onChange={e => setPForm(f => ({ ...f, costoPresupuestado: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <input type="number" className="form-control" value={pForm.orden} onChange={e => setPForm(f => ({ ...f, orden: e.target.value }))} placeholder="1" />
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
