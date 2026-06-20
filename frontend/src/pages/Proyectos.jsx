import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProyectos, getClientes, createProyecto, updateProyecto, fmt, fmtPct, colorMargen, estadoBadge, getRentabilidad } from '../api';
import Modal from '../components/Modal';

const EMPTY_FORM = {
  nombre: '', descripcion: '', clienteId: '', estado: 'borrador',
  presupuestoTotal: '', fechaInicio: '', fechaTermino: '', notas: '',
};

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes,  setClientes]  = useState([]);
  const [margenes,  setMargenes]  = useState({});
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);
  const [filter,    setFilter]    = useState('todos');
  const nav = useNavigate();

  async function load() {
    const [ps, cs] = await Promise.all([getProyectos(), getClientes()]);
    setProyectos(ps);
    setClientes(cs);
    setLoading(false);
    // cargar márgenes de cada proyecto (sin bloquear)
    ps.forEach(p => {
      if (p.estado !== 'borrador') {
        getRentabilidad(p.id)
          .then(r => setMargenes(m => ({ ...m, [p.id]: r.indicadores })))
          .catch(() => {});
      }
    });
  }

  useEffect(() => { load(); }, []);

  const filtered = proyectos.filter(p =>
    filter === 'todos' ? true : p.estado === filter
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function openNew() {
    setEditing(null); setForm(EMPTY_FORM); setError(null); setModal(true);
  }

  function openEdit(e, p) {
    e.stopPropagation();
    setEditing(p);
    setForm({
      nombre: p.nombre, descripcion: p.descripcion || '', clienteId: p.clienteId || '',
      estado: p.estado, presupuestoTotal: p.presupuestoTotal || '',
      fechaInicio: p.fechaInicio || '', fechaTermino: p.fechaTermino || '', notas: p.notas || '',
    });
    setError(null); setModal(true);
  }

  async function handleSave() {
    if (!form.nombre.trim()) return setError('El nombre es requerido');
    setSaving(true); setError(null);
    try {
      if (editing) await updateProyecto(editing.id, form);
      else         await createProyecto(form);
      setModal(false); load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const ESTADOS = ['todos', 'borrador', 'activo', 'pausado', 'cerrado'];

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h2>Proyectos</h2>
          <p>{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>＋ Nuevo Proyecto</button>
      </div>

      {/* Filtros */}
      <div className="tabs">
        {ESTADOS.map(e => (
          <button key={e} className={`tab ${filter === e ? 'active' : ''}`} onClick={() => setFilter(e)}>
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <p>No hay proyectos en este estado.</p>
        </div>
      ) : (
        <div className="proyectos-grid">
          {filtered.map(p => {
            const ind = margenes[p.id];
            const color = ind ? colorMargen(ind.margenPct) : 'blue';
            return (
              <div key={p.id} className={`proyecto-card ${color}`} onClick={() => nav(`/proyectos/${p.id}`)}>
                <div className="card-client">{p.cliente?.nombre || 'Sin cliente'}</div>
                <div className="card-name">{p.nombre}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    {ind ? (
                      <>
                        <div className={`card-margen`} style={{ color: `var(--${color})` }}>
                          {fmtPct(ind.margenPct)}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>margen</div>
                        <div style={{ marginTop: 8 }}>
                          <div className="progress-bar" style={{ width: 120 }}>
                            <div className={`progress-fill ${color}`}
                              style={{ width: `${Math.min(100, Math.max(0, ind.margenPct))}%` }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {p.presupuestoTotal ? fmt(p.presupuestoTotal) : 'Sin presupuesto'}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${estadoBadge(p.estado)}`}>{p.estado}</span>
                    <div style={{ marginTop: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={e => openEdit(e, p)}>✏️</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear Proyecto'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Nombre *</label>
            <input className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del proyecto" />
          </div>
          <div className="two-col">
            <div className="form-group">
              <label>Cliente</label>
              <select className="form-control" value={form.clienteId} onChange={e => set('clienteId', e.target.value)}>
                <option value="">Sin cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-control" value={form.estado} onChange={e => set('estado', e.target.value)}>
                {['borrador','activo','pausado','cerrado'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Presupuesto Total ($)</label>
              <input type="number" className="form-control" value={form.presupuestoTotal} onChange={e => set('presupuestoTotal', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input type="date" className="form-control" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fecha Término</label>
              <input type="date" className="form-control" value={form.fechaTermino} onChange={e => set('fechaTermino', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea className="form-control" rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label>Notas</label>
            <textarea className="form-control" rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>⚠ {error}</p>}
        </Modal>
      )}
    </div>
  );
}
