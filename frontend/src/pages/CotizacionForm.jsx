import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCotizacion, createCotizacion, updateCotizacion,
  getClientes, getConfiguracion, getOficios,
  deleteCotizacion, aprobarCotizacion, cambiarEstadoCotizacion,
  fmt,
} from '../api';
import Modal from '../components/Modal';

const EMPTY_ITEM = { tipo: 'mo', descripcion: '', detalle: '', unidad: 'gl', cantidad: 1, precioUnitario: '', total: 0 };
const ESTADO_BADGE = {
  borrador:  'badge-neutral',
  enviada:   'badge-blue',
  aprobada:  'badge-green',
  rechazada: 'badge-red',
  vencida:   'badge-amber',
};

export default function CotizacionForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    clienteId: '', clienteNombre: '', clienteTelefono: '', clienteEmail: '', clienteDireccion: '',
    descripcionObra: '', condicionesPago: '', exclusiones: '', observaciones: '',
    validezDias: 30, items: [],
  });
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [editItemIdx, setEditItemIdx] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Cargar datos
  useEffect(() => {
    Promise.all([
      isNew ? Promise.resolve(null) : getCotizacion(id),
      getClientes(),
      getConfiguracion(),
      getOficios(),
    ]).then(([cotizacion, cls, cfg]) => {
      setClientes(cls);
      if (cotizacion) {
        setForm({
          clienteId: cotizacion.clienteId || '',
          clienteNombre: cotizacion.clienteNombre,
          clienteTelefono: cotizacion.clienteTelefono,
          clienteEmail: cotizacion.clienteEmail,
          clienteDireccion: cotizacion.clienteDireccion,
          descripcionObra: cotizacion.descripcionObra,
          condicionesPago: cotizacion.condicionesPago,
          exclusiones: cotizacion.exclusiones,
          observaciones: cotizacion.observaciones,
          validezDias: cotizacion.validezDias,
          estado: cotizacion.estado,
          correlativo: cotizacion.correlativo,
          fechaEmision: cotizacion.fechaEmision,
          fechaVencimiento: cotizacion.fechaVencimiento,
          total: cotizacion.total,
          subtotalMO: cotizacion.subtotalMO,
          subtotalMateriales: cotizacion.subtotalMateriales,
          proyectoId: cotizacion.proyectoId,
          items: (cotizacion.items || []).map(i => ({
            id: i.id, tipo: i.tipo, descripcion: i.descripcion, detalle: i.detalle,
            unidad: i.unidad, cantidad: i.cantidad, precioUnitario: i.precioUnitario, total: i.total, orden: i.orden,
          })),
        });
      } else {
        setForm(f => ({
          ...f,
          condicionesPago: cfg?.formaPagoDefault || '50% anticipo — 50% al término',
          exclusiones: cfg?.exclusionesDefault || '',
          observaciones: cfg?.observacionesDefault || '',
          validezDias: cfg?.validezDias || 30,
        }));
      }
      setLoading(false);
    });
  }, [id, isNew]);

  // Seleccionar cliente → autocompletar datos
  function selectCliente(clienteId) {
    const c = clientes.find(x => x.id === clienteId);
    setForm(f => ({
      ...f,
      clienteId: clienteId || '',
      clienteNombre: c?.nombre || '',
      clienteTelefono: c?.telefono || '',
      clienteEmail: c?.email || '',
      clienteDireccion: c?.direccion || '',
    }));
  }

  // Items
  const itemsMO = form.items.filter(i => i.tipo === 'mo');
  const itemsMat = form.items.filter(i => i.tipo === 'material');
  const subtotalMO = itemsMO.reduce((s, i) => s + (parseFloat(i.total) || 0), 0);
  const subtotalMat = itemsMat.reduce((s, i) => s + (parseFloat(i.total) || 0), 0);
  const total = subtotalMO + subtotalMat;

  function openNewItem(tipo) {
    setEditItemIdx(null);
    setItemForm({ ...EMPTY_ITEM, tipo });
    setItemModal(true);
  }

  function openEditItem(idx) {
    setEditItemIdx(idx);
    setItemForm({ ...form.items[idx] });
    setItemModal(true);
  }

  function saveItem() {
    if (!itemForm.descripcion) return;
    const item = {
      ...itemForm,
      cantidad: parseFloat(itemForm.cantidad) || 1,
      precioUnitario: parseFloat(itemForm.precioUnitario) || 0,
      total: (parseFloat(itemForm.cantidad) || 1) * (parseFloat(itemForm.precioUnitario) || 0),
    };
    if (editItemIdx !== null) {
      const items = [...form.items];
      items[editItemIdx] = item;
      setForm(f => ({ ...f, items }));
    } else {
      setForm(f => ({ ...f, items: [...f.items, item] }));
    }
    setItemModal(false);
  }

  function removeItem(idx) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  // Guardar
  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        clienteId: form.clienteId || null,
        items: form.items.map((i, idx) => ({ ...i, orden: idx + 1 })),
      };
      if (isNew) {
        await createCotizacion(payload);
      } else {
        await updateCotizacion(id, payload);
      }
      nav('/cotizaciones');
    } finally {
      setSaving(false);
    }
  }

  // Cambiar estado
  async function handleEstado(estado) {
    await cambiarEstadoCotizacion(id, estado);
    const c = await getCotizacion(id);
    setForm(f => ({ ...f, estado: c.estado }));
  }

  // Aprobar
  async function handleAprobar() {
    if (!confirm('¿Aprobar esta cotización? Se generará un proyecto con las partidas MO.')) return;
    const c = await aprobarCotizacion(id);
    setForm(f => ({ ...f, estado: c.estado, proyectoId: c.proyectoId }));
  }

  // Eliminar
  async function handleDelete() {
    await deleteCotizacion(id);
    nav('/cotizaciones');
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const isEditable = isNew || form.estado === 'borrador';

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/cotizaciones')} style={{ marginBottom: 8 }}>← Volver</button>
          <h2>{isNew ? 'Nueva Cotización' : `${form.correlativo}`}</h2>
          {!isNew && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span className={`badge ${ESTADO_BADGE[form.estado]}`}>{form.estado}</span>
              <span style={{ color: 'var(--text-muted)' }}>· Emisión: {form.fechaEmision}</span>
              <span style={{ color: 'var(--text-muted)' }}>· Vence: {form.fechaVencimiento}</span>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isNew && form.estado === 'borrador' && (
            <button className="btn btn-primary" onClick={() => handleEstado('enviada')}>📤 Marcar Enviada</button>
          )}
          {!isNew && (form.estado === 'borrador' || form.estado === 'enviada') && (
            <button className="btn btn-success" onClick={handleAprobar}>✅ Aprobar</button>
          )}
          {!isNew && form.estado === 'enviada' && (
            <button className="btn btn-danger" onClick={() => handleEstado('rechazada')}>✕ Rechazar</button>
          )}
          {!isNew && (
            <button className="btn btn-primary" onClick={() => window.open(`/api/cotizaciones/${id}/pdf`, '_blank')}>📄 PDF</button>
          )}
          {!isNew && (
            <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}>🗑</button>
          )}
        </div>
      </div>

      <div className="two-col" style={{ gap: 20, marginBottom: 20 }}>
        {/* Cliente */}
        <div className="card">
          <div className="section-title">Cliente</div>
          <div className="form-group">
            <label>Seleccionar cliente</label>
            <select className="form-control" value={form.clienteId} onChange={e => selectCliente(e.target.value)} disabled={!isEditable}>
              <option value="">— Cliente nuevo —</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginTop: 8 }}>
            <label>Nombre *</label>
            <input className="form-control" value={form.clienteNombre} onChange={e => set('clienteNombre', e.target.value)} disabled={!isEditable} />
          </div>
          <div className="two-col" style={{ marginTop: 8 }}>
            <div className="form-group">
              <label>Teléfono</label>
              <input className="form-control" value={form.clienteTelefono} onChange={e => set('clienteTelefono', e.target.value)} disabled={!isEditable} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" value={form.clienteEmail} onChange={e => set('clienteEmail', e.target.value)} disabled={!isEditable} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 8 }}>
            <label>Dirección</label>
            <input className="form-control" value={form.clienteDireccion} onChange={e => set('clienteDireccion', e.target.value)} disabled={!isEditable} />
          </div>
        </div>

        {/* Obra */}
        <div className="card">
          <div className="section-title">Descripción de la obra</div>
          <div className="form-group">
            <textarea className="form-control" rows={4} value={form.descripcionObra} onChange={e => set('descripcionObra', e.target.value)} placeholder="ej: Remodelación de baño principal…" disabled={!isEditable} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group" style={{ marginTop: 8 }}>
            <label>Validez (días)</label>
            <input type="number" className="form-control" value={form.validezDias} onChange={e => set('validezDias', e.target.value)} disabled={!isEditable} />
          </div>
        </div>
      </div>

      {/* Items MO */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>Mano de obra</div>
          {isEditable && <button className="btn btn-sm btn-primary" onClick={() => openNewItem('mo')}>＋ Agregar</button>}
        </div>
        {itemsMO.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin partidas de mano de obra.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descripción</th>
                  <th>Detalle</th>
                  <th>Unidad</th>
                  <th>Cant.</th>
                  <th>P. Unit.</th>
                  <th>Total</th>
                  {isEditable && <th></th>}
                </tr>
              </thead>
              <tbody>
                {itemsMO.map((item, idx) => {
                  const realIdx = form.items.indexOf(item);
                  return (
                    <tr key={realIdx}>
                      <td>{realIdx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{item.descripcion}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.detalle}</td>
                      <td>{item.unidad}</td>
                      <td>{item.cantidad}</td>
                      <td>{fmt(item.precioUnitario)}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(item.total)}</td>
                      {isEditable && (
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditItem(realIdx)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeItem(realIdx)}>🗑</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Items Materiales */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>Materiales</div>
          {isEditable && <button className="btn btn-sm btn-primary" onClick={() => openNewItem('material')}>＋ Agregar</button>}
        </div>
        {itemsMat.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin materiales.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Material</th>
                  <th>Detalle</th>
                  <th>Unidad</th>
                  <th>Cant.</th>
                  <th>P. Unit.</th>
                  <th>Total</th>
                  {isEditable && <th></th>}
                </tr>
              </thead>
              <tbody>
                {itemsMat.map((item, idx) => {
                  const realIdx = form.items.indexOf(item);
                  return (
                    <tr key={realIdx}>
                      <td>{realIdx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{item.descripcion}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.detalle}</td>
                      <td>{item.unidad}</td>
                      <td>{item.cantidad}</td>
                      <td>{fmt(item.precioUnitario)}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(item.total)}</td>
                      {isEditable && (
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditItem(realIdx)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeItem(realIdx)}>🗑</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <div style={{ width: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal MO</span>
            <span>{fmt(subtotalMO)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal Materiales</span>
            <span>{fmt(subtotalMat)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, fontSize: 16 }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Condiciones */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Condiciones</div>
        <div className="form-group">
          <label>Condiciones de pago</label>
          <textarea className="form-control" rows={2} value={form.condicionesPago} onChange={e => set('condicionesPago', e.target.value)} disabled={!isEditable} style={{ resize: 'vertical' }} />
        </div>
        <div className="two-col" style={{ marginTop: 12 }}>
          <div className="form-group">
            <label>Exclusiones</label>
            <textarea className="form-control" rows={3} value={form.exclusiones} onChange={e => set('exclusiones', e.target.value)} disabled={!isEditable} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label>Observaciones</label>
            <textarea className="form-control" rows={3} value={form.observaciones} onChange={e => set('observaciones', e.target.value)} disabled={!isEditable} style={{ resize: 'vertical' }} />
          </div>
        </div>
      </div>

      {/* Acciones */}
      {isEditable && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : isNew ? 'Crear Cotización' : 'Guardar Cambios'}
          </button>
        </div>
      )}

      {/* Modal item */}
      {itemModal && (
        <Modal
          title={editItemIdx !== null ? 'Editar ítem' : 'Nuevo ítem'}
          onClose={() => setItemModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setItemModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveItem}>{(editItemIdx !== null) ? 'Guardar' : 'Agregar'}</button>
            </>
          }
        >
          <div className="form-group">
            <label>Descripción *</label>
            <input className="form-control" value={itemForm.descripcion} onChange={e => setItemForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="ej: Instalación de cerámico" />
          </div>
          <div className="form-group" style={{ marginTop: 8 }}>
            <label>Detalle (opcional)</label>
            <input className="form-control" value={itemForm.detalle} onChange={e => setItemForm(f => ({ ...f, detalle: e.target.value }))} placeholder="ej: Fragüe incluido" />
          </div>
          <div className="two-col" style={{ marginTop: 8 }}>
            <div className="form-group">
              <label>Unidad</label>
              <input className="form-control" value={itemForm.unidad} onChange={e => setItemForm(f => ({ ...f, unidad: e.target.value }))} placeholder="gl, m2, hr…" />
            </div>
            <div className="form-group">
              <label>Cantidad</label>
              <input type="number" step="0.001" className="form-control" value={itemForm.cantidad} onChange={e => setItemForm(f => ({ ...f, cantidad: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Precio Unitario ($)</label>
              <input type="number" className="form-control" value={itemForm.precioUnitario} onChange={e => setItemForm(f => ({ ...f, precioUnitario: e.target.value }))} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Total</label>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)', display: 'block', paddingTop: 4 }}>
                {fmt((parseFloat(itemForm.cantidad) || 1) * (parseFloat(itemForm.precioUnitario) || 0))}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Eliminar confirm */}
      {deleteConfirm && (
        <Modal title="Eliminar cotización" onClose={() => setDeleteConfirm(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
            </>
          }
        >
          <p>¿Eliminar la cotización {form.correlativo}? Esta acción no se puede deshacer.</p>
        </Modal>
      )}
    </div>
  );
}
