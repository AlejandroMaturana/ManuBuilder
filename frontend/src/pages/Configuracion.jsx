import { useEffect, useState } from 'react';
import { getConfiguracion, updateConfiguracion, fmt } from '../api';

export default function Configuracion() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    getConfiguracion()
      .then(cfg => { setForm(cfg); setLoading(false); })
      .catch(err => { setLoadError(err.message); setLoading(false); });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      await updateConfiguracion(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (loadError) return <div className="empty-state"><p style={{ color: 'var(--red)' }}>⚠ {loadError}</p></div>;
  if (!form) return null;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>⚙️ Configuración</h2>
        <p style={{ color: 'var(--text-muted)' }}>Identidad, valores y defaults del sistema</p>
      </div>

      <form onSubmit={handleSave}>
        {/* ── Identidad ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Identidad</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Estos datos aparecerán en cotizaciones y documentos.
          </p>
          <div className="two-col">
            <div className="form-group">
              <label>Nombre / Razón social</label>
              <input className="form-control" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="ej: Tu nombre" />
            </div>
            <div className="form-group">
              <label>Especialidad / Tagline</label>
              <input className="form-control" value={form.especialidad} onChange={e => set('especialidad', e.target.value)} placeholder="ej: Constructor · Maestro integral" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input className="form-control" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+56 9 XXXX XXXX" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contacto@correo.cl" />
            </div>
            <div className="form-group">
              <label>Región / Ciudad</label>
              <input className="form-control" value={form.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="ej: Región del Biobío" />
            </div>
          </div>
        </div>

        {/* ── Negocio ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Negocio</div>
          <div className="two-col">
            <div className="form-group">
              <label>Margen sugerido (%)</label>
              <input type="number" step="0.1" className="form-control" value={form.margenSugerido} onChange={e => set('margenSugerido', e.target.value)} placeholder="30" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Usado en el cálculo de valor sugerido y cotizaciones</span>
            </div>
            <div className="form-group">
              <label>Validez de cotización (días)</label>
              <input type="number" className="form-control" value={form.validezDias} onChange={e => set('validezDias', e.target.value)} placeholder="30" />
            </div>
            <div className="form-group">
              <label>Moneda</label>
              <select className="form-control" value={form.moneda} onChange={e => set('moneda', e.target.value)}>
                <option value="CLP">CLP — Peso chileno</option>
                <option value="USD">USD — Dólar</option>
                <option value="UF">UF — Unidad de fomento</option>
              </select>
            </div>
            <div className="form-group">
              <label>Forma de pago por defecto</label>
              <textarea className="form-control" rows={2} value={form.formaPagoDefault} onChange={e => set('formaPagoDefault', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* ── Cotización defaults ── */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Cotización — Textos por defecto</div>
          <div className="form-group">
            <label>Exclusiones</label>
            <textarea className="form-control" rows={3} value={form.exclusionesDefault} onChange={e => set('exclusionesDefault', e.target.value)} placeholder="Trabajos no descritos en esta cotización&#10;Suministro de materiales no indicados" style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Observaciones</label>
            <textarea className="form-control" rows={3} value={form.observacionesDefault} onChange={e => set('observacionesDefault', e.target.value)} placeholder="Cualquier trabajo adicional será presupuestado y aprobado antes de ejecutarse." style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Pie de página</label>
            <textarea className="form-control" rows={2} value={form.pieCotizacion} onChange={e => set('pieCotizacion', e.target.value)} placeholder="Gracias por su preferencia" style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar configuración'}
          </button>
          {saved && <span style={{ color: 'var(--green)', fontSize: 14 }}>✓ Guardado</span>}
        </div>
      </form>
    </div>
  );
}
