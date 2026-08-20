let db = null;
const ejecutarBtn = document.getElementById('ejecutar');
const limpiarBtn = document.getElementById('limpiar');
const consultaInput = document.getElementById('consulta');
const resultadoDiv = document.getElementById('resultado');
const estadoDiv = document.getElementById('estado');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function cargarBase() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`
    });
    const respuesta = await fetch('database/mundial.db');
    if (!respuesta.ok) throw new Error('No se pudo cargar database/mundial.db');
    const datos = new Uint8Array(await respuesta.arrayBuffer());
    db = new SQL.Database(datos);
    const cantidad = db.exec('SELECT COUNT(*) AS total FROM paises_mundial')[0].values[0][0];
    estadoDiv.textContent = `Base de datos lista · ${cantidad} países`;
    estadoDiv.classList.add('ok');
    ejecutarBtn.disabled = false;
  } catch (error) {
    estadoDiv.textContent = 'No se pudo cargar la base de datos.';
    estadoDiv.classList.add('error');
    resultadoDiv.innerHTML = `<div class="error-box"><strong>Error:</strong> ${escapeHtml(error.message)}<br><small>Comprueba que el proyecto esté publicado en GitHub Pages y que tenga conexión a Internet.</small></div>`;
    console.error(error);
  }
}

function mostrarResultados(results) {
  if (!results.length) {
    resultadoDiv.innerHTML = '<div class="sin-resultados">Consulta ejecutada correctamente. No devolvió filas.</div>';
    return;
  }
  const result = results[0];
  let html = `<div class="resultado-cabecera"><strong>Resultados</strong><span>${result.values.length} fila(s)</span></div>`;
  html += '<div class="tabla-wrap"><table><thead><tr>';
  result.columns.forEach(col => html += `<th>${escapeHtml(col)}</th>`);
  html += '</tr></thead><tbody>';
  result.values.forEach(row => {
    html += '<tr>';
    row.forEach(value => html += `<td>${escapeHtml(value)}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  resultadoDiv.innerHTML = html;
}

ejecutarBtn.disabled = true;
ejecutarBtn.addEventListener('click', () => {
  if (!db) return;
  const consulta = consultaInput.value.trim();
  if (!consulta) {
    resultadoDiv.innerHTML = '<div class="error-box">Escribe una consulta SQL.</div>';
    return;
  }
  try {
    const results = db.exec(consulta);
    mostrarResultados(results);
  } catch (error) {
    resultadoDiv.innerHTML = `<div class="error-box"><strong>Error SQL:</strong> ${escapeHtml(error.message)}</div>`;
  }
});

limpiarBtn.addEventListener('click', () => {
  consultaInput.value = '';
  resultadoDiv.innerHTML = '';
  consultaInput.focus();
});

consultaInput.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') ejecutarBtn.click();
});

cargarBase();
