import { useState } from 'react';
import { createJornada, fmt } from '../api';

const EMPTY_BLOQUE = { partidaId: '', descripcion: '', cantidad: '', costoUnitario: '' };

export default function TarjetaJornada({ proyectoId, partidas = [], onSuccess }) {
  const hoy = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(hoy);
  const [bloques, setBloques] = useState([{ ...EMPTY_BLOQUE }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function updateBloque(i, field, value) {
    setBloques(prev => {
      const copy = prev.map(b => ({ ...b }));
      copy[i][field] = value;

      if (field === 'partidaId') {
        const partida = partidas.find(p => p.id === value);
        copy[i].costoUnitario = partida?.oficio?.valorHora?.toString() || '';
      }

      return copy;
    });
  }

  function addBloque() {
    setBloques(prev => [...prev, { ...EMPTY_BLOQUE }]);
  }

  function removeBloque(i) {
    if (bloques.length <= 1) return;
    setBloques(prev => prev.filter((_, idx) => idx !== i));
  }

  const totalHoras = bloques.reduce((s, b) => s + (parseFloat(b.cantidad) || 0), 0);
  const totalCosto = bloques.reduce((s, b) => s + ((parseFloat(b.cantidad) || 0) * (parseFloat(b.costoUnitario) || 0)), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    const validos = bloques.filter(b => b.descripcion.trim() && parseFloat(b.cantidad) > 0);
    if (validos.length === 0) return setError('Completa al menos un bloque con nombre y horas.');
    setSaving(true); setError(null);
    try {
      await createJornada({
        proyectoId,
        fecha,
        bloques: validos.map(b => ({
          partidaId: b.partidaId || null,
          descripcion: b.descripcion,
          cantidad: parseFloat(b.cantidad),
          costoUnitario: parseFloat(b.costoUnitario) || 0,
        })),
      });
      setBloques([{ ...EMPTY_BLOQUE }]);
      setFecha(hoy);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function getOficio(partidaId) {
    return partidas.find(p => p.id === partidaId)?.oficio || null;
  }

  return (
    <div className="tj-card">
      <div className="tj-header">
        <div className="section-title">Tarjeta de Jornada</div>
        <div className="form-group" style={{ marginBottom: 0, minWidth: 170 }}>
          <label>Fecha de la jornada</label>
          <input type="date" className="form-control" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="tj-blocks">
          {bloques.map((bloque, i) => {
            const oficio = getOficio(bloque.partidaId);
            const blockTotal = (parseFloat(bloque.cantidad) || 0) * (parseFloat(bloque.costoUnitario) || 0);
            return (
              <div key={i} className="tj-block">
                <div className="tj-block-header">
                  <span className="tj-block-num">#{i + 1}</span>
                  {oficio && (
                    <span className="tj-oficio-tag" style={{ background: oficio.color + '22', color: oficio.color }}>
                      {oficio.nombre}
                    </span>
                  )}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeBloque(i)} disabled={bloques.length <= 1} style={{ marginLeft: 'auto' }}>
                    ✕
                  </button>
                </div>
                <div className="tj-block-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Partida</label>
                    <select className="form-control" value={bloque.partidaId} onChange={e => updateBloque(i, 'partidaId', e.target.value)}>
                      <option value="">— Seleccionar —</option>
                      {partidas.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} {p.oficio ? `(${p.oficio.nombre})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Nombre / Descripción</label>
                    <input className="form-control" placeholder="ej: Juan Pérez" value={bloque.descripcion} onChange={e => updateBloque(i, 'descripcion', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Horas</label>
                    <input type="number" step="0.5" className="form-control" placeholder="0" value={bloque.cantidad} onChange={e => updateBloque(i, 'cantidad', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Valor Hora ($)</label>
                    <input type="number" step="1" className="form-control" placeholder="0" value={bloque.costoUnitario} onChange={e => updateBloque(i, 'costoUnitario', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Total</label>
                    <span className="tj-block-total">{fmt(blockTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" className="btn btn-ghost" onClick={addBloque} style={{ width: '100%', marginTop: 12 }}>
          ＋ Agregar bloque
        </button>

        <div className="tj-summary">
          <div className="tj-summary-item">
            <span className="tj-summary-label">Bloques</span>
            <span className="tj-summary-val">{bloques.length}</span>
          </div>
          <div className="tj-summary-item">
            <span className="tj-summary-label">Total HH</span>
            <span className="tj-summary-val">{totalHoras.toFixed(1)} hrs</span>
          </div>
          <div className="tj-summary-item">
            <span className="tj-summary-label">Costo Total Jornada</span>
            <span className="tj-summary-val" style={{ color: 'var(--green)', fontSize: 22 }}>{fmt(totalCosto)}</span>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 180 }}>
            {saving ? 'Guardando…' : 'Registrar Jornada'}
          </button>
        </div>

        {error && <p style={{ color: 'var(--red)', marginTop: 8, fontSize: 13 }}>⚠ {error}</p>}
      </form>
    </div>
  );
}
