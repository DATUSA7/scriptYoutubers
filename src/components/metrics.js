// src/components/metrics.js

export function renderizarMetricasGenerales(videos) {
  if (!videos || videos.length === 0) {
    return;
  }

  // 1. Cálculos globales
  const totalVideos = videos.length;
  const totalVistas = videos.reduce((acc, video) => acc + video.vistas, 0);
  const totalLikes = videos.reduce((acc, video) => acc + video.likes, 0);
  const totalComentarios = videos.reduce((acc, video) => acc + video.comentarios, 0);

  // 2. Cálculo del Engagement Rate: ((Likes + Comentarios) / Vistas) * 100
  let engagementRate = 0;
  if (totalVistas > 0) {
    engagementRate = ((totalLikes + totalComentarios) / totalVistas) * 100;
  }

  // 3. Pintar en el DOM con formato limpio
  document.getElementById('kpi-videos').textContent = totalVideos.toLocaleString();
  document.getElementById('kpi-vistas').textContent = totalVistas.toLocaleString();
  document.getElementById('kpi-likes').textContent = totalLikes.toLocaleString();
  document.getElementById('kpi-comentarios').textContent = totalComentarios.toLocaleString();
  document.getElementById('kpi-engagement').textContent = engagementRate.toFixed(2) + '%';
}