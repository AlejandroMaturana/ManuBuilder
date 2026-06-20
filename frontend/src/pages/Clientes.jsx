import { useEffect, useState } from 'react';
import { getClientes, createCliente, updateCliente } from '../api';
import Modal from '../components/Modal';

const EMPTY = { nombre: '', rut: '', telefono: '', email: '', direccion: '', notas: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  const load = () =>
    getClientes().then(setClientes).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.rut || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setModal(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({ nombre: c.nombre, rut: c.rut || '', telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '', notas: c.notas || '' });
    setError(null);
    setModal(true);
  }

  async function handleSave() {
    if (!form.nombre.trim()) return setError('El nombre es requerido');
    setSaving(true); setError(null);
    try {
      if (editing) await updateCliente(editing.id, form);
      else         await createCliente(form);
      setModal(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h2>Clientes</h2>
          <p>{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrados</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              className="form-control"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openNew}>＋ Nuevo Cliente</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>{search ? 'Sin resultados para esa búsqueda.' : 'Aún no hay clientes. ¡Agrega el primero!'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.nombre}</td>
                  <td>{c.rut || '—'}</td>
                  <td>{c.telefono || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.direccion || '—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>✏️ Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar Cambios' : 'Crear Cliente'}
              </button>
            </>
          }
        >
          <div className="two-col">
            <div className="form-group">
              <label>Nombre *</label>
              <input className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label>RUT</label>
              <input className="form-control" value={form.rut} onChange={e => set('rut', e.target.value)} placeholder="12.345.678-9" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input className="form-control" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.cl" />
            </div>
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input className="form-control" value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Principal 123, Santiago" />
          </div>
          <div className="form-group">
            <label>Notas</label>
            <textarea className="form-control" rows={3} value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Observaciones adicionales..." style={{ resize: 'vertical' }} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>⚠ {error}</p>}
        </Modal>
      )}
    </div>
  );
}
