// src/components/top10.js

export function renderizarTop10(videos) {
  const container = document.getElementById('top-10-container');
  
  if (!container || !videos || videos.length === 0) {
    return;
  }

  // 1. Ordenar los videos de mayor a menor según las vistas (b.vistas - a.vistas)
  // 2. Tomar únicamente los primeros 10 elementos con .slice(0, 10)
  const topVideos = [...videos]
    .sort((a, b) => b.vistas - a.vistas)
    .slice(0, 10);

  // Construir la estructura HTML en formato de lista o tarjetas
  let html = '<ol class="top-list">';
  
  topVideos.forEach((video, index) => {
    html += `
      <li class="top-item">
        <span class="top-rank">#${index + 1}</span>
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