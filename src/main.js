import { obtenerVideos } from './components/store.js';
import { renderizarMetricasGenerales } from './components/metrics.js';
import { inicializarTop10Scene } from './components/top10Scene.js';
import { inicializarMenosVistosScene } from './components/menosVistosScene.js';
import { inicializarPlaylistsScene } from './components/playlistsScene.js';
import { inicializarCrecimientoScene } from './components/crecimientoScene.js';
import { inicializarCrecimientoMenosVistosScene } from './components/crecimientoMenosVistosScene.js';
import './style.css';

document.addEventListener('DOMContentLoaded', async () => {
  const videos = await obtenerVideos();

  const accionesPorSeccion = {
    'seccion-general-canal': () => renderizarMetricasGenerales(videos),
    'seccion-top10': () => inicializarTop10Scene(videos),
    'seccion-menos-vistos': () => inicializarMenosVistosScene(videos),
    'seccion-playlists': () => inicializarPlaylistsScene(videos),
    'seccion-crecimiento-mas': () => inicializarCrecimientoScene(videos),
    'seccion-crecimiento-menos': () => inicializarCrecimientoMenosVistosScene(videos),
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idSeccion = entry.target.id;
        
        if (accionesPorSeccion[idSeccion]) {
          accionesPorSeccion[idSeccion]();
          observerInstance.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.observer-section').forEach(seccion => {
    observer.observe(seccion);
  });
});