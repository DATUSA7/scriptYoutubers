// src/components/menosVistos.js

export function renderizarMenosVistos(videos) {
  const container = document.getElementById('menos-vistos-container');
  
  if (!container || !videos || videos.length === 0) {
    return;
  }

  // 1. Ordenar los videos de menor a mayor según las vistas (a.vistas - b.vistas)
  // 2. Tomar los primeros 10 elementos con .slice(0, 10)
  const videosMenosVistos = [...videos]
    .sort((a, b) => a.vistas - b.vistas)
    .slice(0, 10);

  // Construir la estructura HTML
  let html = '<ol class="top-list menos-list">';
  
  videosMenosVistos.forEach((video, index) => {
    html += `
      <li class="top-item">
        <span class="top-rank menos-rank">#${index + 1}</span>
        <div class="top-info">
          <a href="${video.enlace}" target="_blank" rel="noopener noreferrer" class="top-title">
            ${video.titulo}
          </a>
          <span class="top-views">👁️ ${video.vistas.toLocaleString()} vistas</span>
        </div>
      </li>
    `;
  });
  
  html += '</ol>';

  // Inyectar en el DOM
  container.innerHTML = html;
}