import * as THREE from 'three';

export function inicializarMenosVistosScene(videos) {
  const container = document.getElementById('menos-vistos-canvas-container');
  const detailCard = document.getElementById('menos-vistos-detail-card');
  
  if (!container || !videos || videos.length === 0) return;

  // 1. Obtener el Top 10 de MENOS vistos (orden ascendente)
  const menosVistos = [...videos]
    .sort((a, b) => a.vistas - b.vistas)
    .slice(0, 10);

  // 2. Configuración básica de Three.js
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

  // 4. Crear los cilindros 3D
  const cylinders = [];
  // Tomamos como referencia el video con más vistas dentro de este grupo de 10 para escalar proporcionalmente
  const maxViews = menosVistos[menosVistos.length - 1].vistas || 1; 
  const spacing = 1.2;
  const startX = -((menosVistos.length - 1) * spacing) / 2;

  menosVistos.forEach((video, index) => {
    // Altura proporcional (garantizando un mínimo de 0.5 unidades)
    const height = Math.max((video.vistas / maxViews) * 4, 0.5);
    
    const geometry = new THREE.CylinderGeometry(0.35, 0.35, height, 32);
    
    // Material con un color distintivo (ej. un tono plateado/azulado para menos vistos)
    const material = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, 
      roughness: 0.3,
      metalness: 0.8
    });

    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.set(startX + (index * spacing), height / 2, 0);
    
    // Guardar datos del video en userData
    cylinder.userData = { videoData: video, rank: index + 1 };
    
    scene.add(cylinder);
    cylinders.push(cylinder);
  });

  // 5. Interactividad con Raycaster (Clics)
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
      const { videoData, rank } = selectedMesh.userData;
      
      const engagement = videoData.vistas > 0 
        ? (((videoData.likes + videoData.comentarios) / videoData.vistas) * 100).toFixed(2) 
        : 0;

      detailCard.innerHTML = `
        <div class="detail-content">
          <div class="detail-rank menos-rank-label">#${rank} Menos Visto</div>
          <h3 class="detail-title">${videoData.titulo}</h3>
          <div class="detail-metrics-grid">
            <div><span>👁️ Vistas:</span> <strong>${videoData.vistas.toLocaleString()}</strong></div>
            <div><span>❤️ Likes:</span> <strong>${videoData.likes.toLocaleString()}</strong></div>
            <div><span>💬 Comentarios:</span> <strong>${videoData.comentarios.toLocaleString()}</strong></div>
            <div><span>🔥 Engagement:</span> <strong>${engagement}%</strong></div>
          </div>
          <a href="${videoData.enlace}" target="_blank" rel="noopener noreferrer" class="detail-btn">Ver Video en YouTube</a>
        </div>
      `;
      
      selectedMesh.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => selectedMesh.scale.set(1, 1, 1), 200);
    }
  }

  renderer.domElement.addEventListener('click', onClick);

  // 6. Bucle de animación
  function animate() {
    requestAnimationFrame(animate);
    
    cylinders.forEach((cyl) => {
      cyl.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
  }
  animate();

  // 7. Redimensionamiento responsivo
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}