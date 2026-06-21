'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const TEMPLATE = fs.readFileSync(path.join(__dirname, '..', 'templates', 'cotizacion.html'), 'utf8');

function fmt(n) {
  const v = parseFloat(n || 0);
  return '$ ' + v.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderItems(items, tipo) {
  const filtered = (items || []).filter(i => i.tipo === tipo);
  if (filtered.length === 0) {
    return '<p style="color:var(--ink-soft);font-size:12px;margin-bottom:28px;">Sin partidas.</p>';
  }

  let html = `<table>
    <thead><tr>
      <th style="width:32px">#</th>
      <th>${tipo === 'mo' ? 'Descripción' : 'Material'}</th>
      <th class="r" style="width:60px">Unid.</th>
      <th class="r" style="width:52px">Cant.</th>
      <th class="r" style="width:90px">P. Unit.</th>
      <th class="r" style="width:90px">Total</th>
    </tr></thead><tbody>`;

  filtered.forEach((it, i) => {
    const num = String(i + 1).padStart(2, '0');
    const detalle = it.detalle ? `<div class="item-desc">${esc(it.detalle)}</div>` : '';
    html += `<tr>
      <td class="num">${num}</td>
      <td>${esc(it.descripcion)}${detalle}</td>
      <td class="num">${esc(it.unidad)}</td>
      <td class="num">${parseFloat(it.cantidad || 0)}</td>
      <td class="num">${fmt(it.precioUnitario)}</td>
      <td class="total-col">${fmt(it.total)}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  return html;
}

function renderContactLines(lines) {
  return lines.filter(Boolean).map(l => `<span>${esc(l)}</span>`).join('\n');
}

function renderExclusionList(text) {
  if (!text) return '<li style="color:var(--ink-soft)">—</li>';
  return text.split('\n').filter(Boolean).map(l => `<li>${esc(l)}</li>`).join('\n');
}

async function generarPDF(cotizacion, config) {
  const brandContact = renderContactLines([
    config?.telefono,
    config?.email,
    config?.ciudad,
  ]);

  const footerContact = renderContactLines([
    config?.telefono,
    config?.email,
  ]);

  const clientLines = [];
  if (cotizacion.clienteTelefono) clientLines.push(esc(cotizacion.clienteTelefono));
  if (cotizacion.clienteEmail) clientLines.push(esc(cotizacion.clienteEmail));
  if (cotizacion.clienteDireccion) clientLines.push(esc(cotizacion.clienteDireccion));
  const clienteDetalle = clientLines.join('<br>\n');

  const html = TEMPLATE
    .replace(/\{\{BRAND_NAME\}\}/g,          esc(config?.nombre || 'ManuBuilder'))
    .replace(/\{\{BRAND_TAG\}\}/g,           esc(config?.especialidad || ''))
    .replace(/\{\{BRAND_CONTACT\}\}/g,       brandContact)
    .replace(/\{\{CORRELATIVO\}\}/g,         esc(cotizacion.correlativo || ''))
    .replace(/\{\{FECHA_EMISION\}\}/g,       cotizacion.fechaEmision || '')
    .replace(/\{\{FECHA_VENCIMIENTO\}\}/g,   cotizacion.fechaVencimiento || '')
    .replace(/\{\{CLIENTE_NOMBRE\}\}/g,      esc(cotizacion.clienteNombre || '—'))
    .replace(/\{\{CLIENTE_DETALLE\}\}/g,     clienteDetalle || '—')
    .replace(/\{\{DESCRIPCION_OBRA\}\}/g,    esc(cotizacion.descripcionObra || '—'))
    .replace(/\{\{ITEMS_MO_TABLE\}\}/g,      renderItems(cotizacion.items, 'mo'))
    .replace(/\{\{ITEMS_MATERIALES_TABLE\}\}/g, renderItems(cotizacion.items, 'material'))
    .replace(/\{\{SUBTOTAL_MO\}\}/g,         fmt(cotizacion.subtotalMO))
    .replace(/\{\{SUBTOTAL_MATERIALES\}\}/g, fmt(cotizacion.subtotalMateriales))
    .replace(/\{\{TOTAL\}\}/g,               fmt(cotizacion.total))
    .replace(/\{\{CONDICIONES_PAGO\}\}/g,    esc(cotizacion.condicionesPago || '—'))
    .replace(/\{\{EXCLUSIONES\}\}/g,         renderExclusionList(cotizacion.exclusiones))
    .replace(/\{\{OBSERVACIONES\}\}/g,       esc(cotizacion.observaciones || '—'))
    .replace(/\{\{VALIDEZ_DIAS\}\}/g,        cotizacion.validezDias || '30')
    .replace(/\{\{SIGN_NAME\}\}/g,           esc(config?.nombre || '—'))
    .replace(/\{\{SIGN_ROLE\}\}/g,           esc(config?.especialidad || 'Constructor · Maestro integral'))
    .replace(/\{\{FOOTER_CONTACT\}\}/g,      footerContact);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

module.exports = { generarPDF };
