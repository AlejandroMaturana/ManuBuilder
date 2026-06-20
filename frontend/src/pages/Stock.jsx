import { useEffect, useState } from 'react';
import { getStock, createStock, updateStock, consumirStock, fmt } from '../api';
import Modal from '../components/Modal';

const EMPTY = { nombre: '', unidad: 'und', cantidadDisponible: '', costoReferencial: '', ubicacion: '', notas: '' };
const UNIDADES = ['und', 'kg', 'm2', 'm3', 'ml', 'lt', 'gl', 'hr'];

export default function Stock() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  // Modal de consumo
  const [consumoModal, setConsumoModal] = useState(null);
  const [consumoCant,  setConsumoCant]  = useState('');

  const load = () => getStock().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (i.ubicacion || '').toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function openNew() {
    setEditing(null); setForm(EMPTY); setError(null); setModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      nombre: item.nombre, unidad: item.unidad || 'und',
      cantidadDisponible: item.cantidadDisponible, costoReferencial: item.costoReferencial || '',
      ubicacion: item.ubicacion || '', notas: item.notas || '',
    });
    setError(null); setModal(true);
  }

  async function handleSave() {
    if (!form.nombre.trim()) return setError('El nombre es requerido');
    setSaving(true); setError(null);
    try {
      if (editing) await updateStock(editing.id, form);
      else         await createStock(form);
      setModal(false); load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleConsumir() {
    if (!consumoCant || parseFloat(consumoCant) <= 0) return;
    await consumirStock(consumoModal.id, parseFloat(consumoCant));
    setConsumoModal(null); setConsumoCant('');
    load();
  }

  const stockBadge = (cant) => {
    const n = parseFloat(cant);
    if (n <= 0)    return 'badge-red';
    if (n < 5)     return 'badge-amber';
    return 'badge-green';
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h2>Stock / Inventario</h2>
          <p>{items.length} ítem{items.length !== 1 ? 's' : ''} en bodega</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input className="form-control" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openNew}>＋ Agregar Ítem</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>{search ? 'Sin resultados.' : 'No hay ítems en el inventario.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Disponible</th>
                <th>Unidad</th>
                <th>Costo Ref.</th>
                <th>Ubicación</th>
                <th>Valor Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const cant = parseFloat(item.cantidadDisponible) || 0;
                const costo = parseFloat(item.costoReferencial) || 0;
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700 }}>{item.nombre}</td>
                    <td>
                      <span className={`badge ${stockBadge(cant)}`}>{cant}</span>
                    </td>
                    <td>{item.unidad || '—'}</td>
                    <td>{costo ? fmt(costo) : '—'}</td>
                    <td>{item.ubicacion || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      {cant && costo ? fmt(cant * costo) : '—'}
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setConsumoModal(item); setConsumoCant(''); }}>
                        📤 Consumir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo/editar */}
      {modal && (
        <Modal
          title={editing ? 'Editar Ítem' : 'Nuevo Ítem de Stock'}
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Nombre *</label>
            <input className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="ej: Cemento Portland" />
          </div>
          <div className="two-col">
            <div className="form-group">
              <label>Cantidad Disponible</label>
              <input type="number" step="0.001" className="form-control" value={form.cantidadDisponible} onChange={e => set('cantidadDisponible', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Unidad</label>
              <select className="form-control" value={form.unidad} onChange={e => set('unidad', e.target.value)}>
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Costo Referencial ($)</label>
              <input type="number" className="form-control" value={form.costoReferencial} onChange={e => set('costoReferencial', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Ubicación</label>
              <input className="form-control" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} placeholder="Bodega / Camioneta" />
            </div>
          </div>
          <div className="form-group">
            <label>Notas</label>
            <textarea className="form-control" rows={2} value={form.notas} onChange={e => set('notas', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>⚠ {error}</p>}
        </Modal>
      )}

      {/* Modal consumo */}
      {consumoModal && (
        <Modal
          title={`Consumir: ${consumoModal.nombre}`}
          onClose={() => setConsumoModal(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConsumoModal(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleConsumir}>📤 Confirmar Consumo</button>
            </>
          }
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Stock disponible: <strong style={{ color: 'var(--text-primary)' }}>{consumoModal.cantidadDisponible} {consumoModal.unidad}</strong>
          </p>
          <div className="form-group">
            <label>Cantidad a consumir</label>
            <input
              type="number" step="0.001" className="form-control"
              value={consumoCant}
              onChange={e => setConsumoCant(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
