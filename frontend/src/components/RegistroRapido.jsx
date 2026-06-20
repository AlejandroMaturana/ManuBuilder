import { useState, useEffect } from 'react';
import { createRegistro, getStock, fmt } from '../api';

const TIPOS = ['hh', 'material', 'gasto'];
const UNIDADES = ['hr', 'kg', 'm2', 'm3', 'ml', 'und', 'gl', 'lt'];

export default function RegistroRapido({ proyectoId, partidas = [], onSuccess }) {
  const hoy = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    tipo: 'hh',
    descripcion: '',
    cantidad: '',
    unidad: 'hr',
    costoUnitario: '',
    fecha: hoy,
    partidaId: '',
  });
  const [origen, setOrigen] = useState('compra');
  const [stockItems, setStockItems] = useState([]);
  const [selStockId, setSelStockId] = useState('');
  const [loadingStock, setLoadingStock] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Cargar stock cuando se selecciona "Desde mi stock"
  useEffect(() => {
    if (form.tipo === 'material' && origen === 'stock' && stockItems.length === 0) {
      setLoadingStock(true);
      getStock()
        .then(items => setStockItems(items.filter(i => parseFloat(i.cantidadDisponible) > 0)))
        .finally(() => setLoadingStock(false));
    }
  }, [form.tipo, origen, stockItems.length]);

  // Resetear origen al cambiar de tipo
  useEffect(() => {
    if (form.tipo !== 'material') {
      setOrigen('compra');
      setSelStockId('');
    }
  }, [form.tipo]);

  const selStockItem = stockItems.find(i => i.id === selStockId);

  function handleStockSelect(stockId) {
    setSelStockId(stockId);
    const item = stockItems.find(i => i.id === stockId);
    if (item) {
      set('descripcion', item.nombre);
      set('costoUnitario', item.costoReferencial?.toString() || '');
      set('unidad', item.unidad || 'und');
    }
  }

  const costoTotal = (parseFloat(form.cantidad) || 0) * (parseFloat(form.costoUnitario) || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.descripcion || !form.cantidad) return;
    setSaving(true); setError(null);
    try {
      const payload = {
        ...form,
        proyectoId,
        costoTotal,
        cantidad:      parseFloat(form.cantidad),
        costoUnitario: parseFloat(form.costoUnitario) || 0,
      };
      if (origen === 'stock' && selStockId) {
        payload.esStockPropio = true;
        payload.stockId = selStockId;
      }
      await createRegistro(payload);
      setForm({ tipo: 'hh', descripcion: '', cantidad: '', unidad: 'hr', costoUnitario: '', fecha: hoy, partidaId: '' });
      setOrigen('compra');
      setSelStockId('');
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rr-form">
      <div className="section-title">⚡ Captura Rápida</div>
      <form onSubmit={handleSubmit}>
        <div className="rr-grid">
          {/* Tipo */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipo</label>
            <select className="form-control" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Origen (solo para material) */}
          {form.tipo === 'material' && (
            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label>Origen del material</label>
              <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name="origen" checked={origen === 'compra'} onChange={() => { setOrigen('compra'); setSelStockId(''); }} />
                  Compra directa
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name="origen" checked={origen === 'stock'} onChange={() => setOrigen('stock')} />
                  Desde mi stock
                </label>
              </div>
            </div>
          )}

          {/* Selector de ítem de stock */}
          {form.tipo === 'material' && origen === 'stock' && (
            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 3' }}>
              <label>Ítem de inventario *</label>
              {loadingStock ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando stock…</div>
              ) : stockItems.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No hay ítems disponibles en el inventario.</div>
              ) : (
                <select className="form-control" value={selStockId} onChange={e => handleStockSelect(e.target.value)}>
                  <option value="">— Seleccionar ítem —</option>
                  {stockItems.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.nombre} ({i.cantidadDisponible} {i.unidad} disp.)
                    </option>
                  ))}
                </select>
              )}
              {selStockItem && (
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Disponible: <strong style={{ color: 'var(--green)' }}>{selStockItem.cantidadDisponible} {selStockItem.unidad}</strong>
                  {selStockItem.ubicacion && <span> · Ubicación: {selStockItem.ubicacion}</span>}
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
            <label>Descripción *</label>
            <input
              className="form-control"
              placeholder="ej: Colocación cerámica baño"
              value={form.descripcion}
              onChange={e => {
                set('descripcion', e.target.value);
                if (origen === 'stock') setSelStockId('');
              }}
              required
            />
          </div>

          {/* Cantidad + Unidad */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Cantidad *</label>
            <input
              type="number" step="0.001" className="form-control"
              placeholder="0"
              value={form.cantidad}
              onChange={e => set('cantidad', e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Unidad</label>
            <select className="form-control" value={form.unidad} onChange={e => set('unidad', e.target.value)}>
              {UNIDADES.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="rr-grid" style={{ marginTop: '10px' }}>
          {/* Costo unitario */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Costo Unit. ($)</label>
            <input
              type="number" step="1" className="form-control"
              placeholder="0"
              value={form.costoUnitario}
              onChange={e => set('costoUnitario', e.target.value)}
            />
          </div>

          {/* Partida */}
          <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
            <label>Partida</label>
            <select className="form-control" value={form.partidaId} onChange={e => set('partidaId', e.target.value)}>
              <option value="">Sin partida</option>
              {partidas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {/* Fecha */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Fecha</label>
            <input type="date" className="form-control" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
          </div>

          {/* Total + Submit */}
          <div className="form-group" style={{ marginBottom: 0, alignItems: 'flex-end' }}>
            <label>Total calculado</label>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green)', paddingBottom: '10px' }}>
              {fmt(costoTotal)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
              {saving ? '…' : '＋ Registrar'}
            </button>
          </div>
        </div>

        {error && <p style={{ color: 'var(--red)', marginTop: '8px', fontSize: '13px' }}>⚠ {error}</p>}
      </form>
    </div>
  );
}
