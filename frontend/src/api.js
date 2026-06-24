// ── API module — todas las llamadas al backend ───────────────
const BASE = '/api';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Error de red');
  }
  return res.json();
}

// ── Clientes ──────────────────────────────────────────────────
export const getClientes     = ()           => req('GET',  '/clientes');
export const createCliente   = (data)       => req('POST', '/clientes', data);
export const updateCliente   = (id, data)   => req('PUT',  `/clientes/${id}`, data);

// ── Proyectos ─────────────────────────────────────────────────
export const getProyectos    = ()           => req('GET',  '/proyectos');
export const getProyecto     = (id)         => req('GET',  `/proyectos/${id}`);
export const createProyecto  = (data)       => req('POST', '/proyectos', data);
export const updateProyecto  = (id, data)   => req('PUT',  `/proyectos/${id}`, data);
export const getRentabilidad = (id)         => req('GET',  `/proyectos/${id}/rentabilidad`);
export const getPartidas     = (id)         => req('GET',  `/proyectos/${id}/partidas`);
export const createPartida   = (id, data)   => req('POST', `/proyectos/${id}/partidas`, data);

// ── Cotizaciones ──────────────────────────────────────────────
export const getCotizaciones     = ()           => req('GET',  '/cotizaciones');
export const getCotizacion       = (id)         => req('GET',  `/cotizaciones/${id}`);
export const createCotizacion    = (data)       => req('POST', '/cotizaciones', data);
export const updateCotizacion    = (id, data)   => req('PUT',  `/cotizaciones/${id}`, data);
export const deleteCotizacion    = (id)         => req('DELETE',`/cotizaciones/${id}`);
export const aprobarCotizacion   = (id)         => req('POST', `/cotizaciones/${id}/aprobar`);
export const cambiarEstadoCotizacion = (id, estado) => req('PUT', `/cotizaciones/${id}/estado`, { estado });

// ── Configuracion ──────────────────────────────────────────────
export const getConfiguracion    = ()           => req('GET',  '/configuracion');
export const updateConfiguracion = (data)       => req('PUT',  '/configuracion', data);

// ── Oficios ───────────────────────────────────────────────────
export const getOficios     = ()           => req('GET',  '/oficios');

// ── Partidas ──────────────────────────────────────────────────
export const updatePartida   = (id, data)   => req('PUT',  `/partidas/${id}`, data);
export const deletePartida   = (id)         => req('DELETE',`/partidas/${id}`);

// ── Registros ─────────────────────────────────────────────────
export const getRegistros    = (params = {})=> req('GET',  '/registros?' + new URLSearchParams(params));
export const createRegistro  = (data)       => req('POST', '/registros', data);
export const updateRegistro  = (id, data)   => req('PUT',  `/registros/${id}`, data);
export const deleteRegistro  = (id)         => req('DELETE',`/registros/${id}`);
export const createJornada   = (data)       => req('POST', '/registros/jornada', data);

// ── Stock ─────────────────────────────────────────────────────
export const getStock        = ()           => req('GET',  '/stock');
export const createStock     = (data)       => req('POST', '/stock', data);
export const updateStock     = (id, data)   => req('PUT',  `/stock/${id}`, data);
export const consumirStock   = (id, cant)   => req('POST', `/stock/${id}/consumir`, { cantidad: cant });

// ── Dashboard ─────────────────────────────────────────────────
export const getDashboard    = ()           => req('GET',  '/dashboard');

// ── Helpers ───────────────────────────────────────────────────
export const fmt = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(n ?? 0);

export const fmtPct = (n) => `${Number(n ?? 0).toFixed(1)}%`;

export const colorMargen = (pct) => {
  const p = Number(pct);
  if (p >= 20)  return 'green';
  if (p >= 0)   return 'amber';
  return 'red';
};

export const estadoBadge = (estado) => ({
  activo:   'badge-green',
  borrador: 'badge-neutral',
  pausado:  'badge-amber',
  cerrado:  'badge-blue',
}[estado] || 'badge-neutral');
