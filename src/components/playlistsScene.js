import * as THREE from 'three';

export function inicializarPlaylistsScene(videos) {
  const container = document.getElementById('playlists-canvas-container');
  const detailCard = document.getElementById('playlists-detail-card');
  
  if (!container || !videos || videos.length === 0) return;

  // 1. Agrupar los videos usando la propiedad oficial "playlist" que viene del JSON
  const playlistMap = {};

  videos.forEach(video => {
    const cat = video.playlist || "General";
    
    if (!playlistMap[cat]) {
      playlistMap[cat] = {
        nombre: cat,
        totalVideos: 0,
        vistas: 0,
        likes: 0,
        comentarios: 0
      };
    }

    playlistMap[cat].totalVideos += 1;
    playlistMap[cat].vistas += video.vistas;
    playlistMap[cat].likes += video.likes;
    playlistMap[cat].comentarios += video.comentarios;
  });

  const playlistsArray = Object.values(playlistMap).sort((a, b) => b.vistas - a.vistas);

  if (playlistsArray.length === 0) return;

  // 2. Configuración de Three.js
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 14);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 3. Iluminación
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // 4. Crear los cilindros 3D por cada Playlist real encontrada
  const cylinders = [];
  const maxViews = playlistsArray[0].vistas || 1;
  const spacing = 1.5;
  const startX = -((playlistsArray.length - 1) * spacing) / 2;

  playlistsArray.forEach((item, index) => {
    const height = Math.max((item.vistas / maxViews) * 4, 0.5);
    
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, height, 32);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x10b981, 
      roughness: 0.3,
      metalness: 0.8
    });

    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(startX + (index * spacing), height / 2, 0);
    
    cylinder.userData = { playlistData: item, rank: index + 1 };
    
    scene.add(cylinder);
    cylinders.push(cylinder);
  });

  // 5. Interactividad con Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cylinders);

    if (intersects.length > 0) {
      const selectedMesh = intersects[0].object;
      const { playlistData, rank } = selectedMesh.userData;
      
      const engagement = playlistData.vistas > 0 
        ? (((playlistData.likes + playlistData.comentarios) / playlistData.vistas) * 100).toFixed(2) 
        : 0;

      detailCard.innerHTML = `
        <div class="detail-content">
          <div class="detail-rank" style="color: #10b981;">Playlist #${rank}</div>
          <h3 class="detail-title">${playlistData.nombre}</h3>
          <div class="detail-metrics-grid">
            <div><span>🎬 Total Videos:</span> <strong>${playlistData.totalVideos.toLocaleString()}</strong></div>
            <div><span>👁️ Vistas:</span> <strong>${playlistData.vistas.toLocaleString()}</strong></div>
            <div><span>❤️ Likes:</span> <strong>${playlistData.likes.toLocaleString()}</strong></div>
            <div><span>💬 Comentarios:</span> <strong>${playlistData.comentarios.toLocaleString()}</strong></div>
            <div><span>🔥 Engagement:</span> <strong>${engagement}%</strong></div>
          </div>
        </div>
      `;
      
      selectedMesh.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => selectedMesh.scale.set(1, 1, 1), 200);
    }
  }

  renderer.domElement.addEventListener('click', onClick);

  function animate() {
    requestAnimationFrame(animate);
    cylinders.forEach((cyl) => {
      cyl.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}