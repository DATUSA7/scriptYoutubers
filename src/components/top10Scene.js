import * as THREE from 'three';

export function inicializarTop10Scene(videos) {
  const container = document.getElementById('top10-canvas-container');
  const detailCard = document.getElementById('top10-detail-card');
  
  if (!container || !videos || videos.length === 0) return;

  // 1. Obtener el Top 10 ordenado por vistas
  const topVideos = [...videos]
    .sort((a, b) => b.vistas - a.vistas)
    .slice(0, 10);

  // 2. Configuración básica de Three.js
  const scene = new THREE.Scene();
  
  // Cámara
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 14);
  camera.lookAt(0, 1, 0);

  // Renderizador
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 3. Luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // 4. Crear los cilindros (barras 3D)
  const cylinders = [];
  const maxViews = topVideos[0].vistas; // Referencia para escalar la altura máxima a 4 unidades
  const spacing = 1.2;
  const startX = -((topVideos.length - 1) * spacing) / 2;

  topVideos.forEach((video, index) => {
    // Calcular altura proporcional
    const height = Math.max((video.vistas / maxViews) * 4, 0.5);
    
    // Geometría del cilindro (radioTop, radioBottom, altura, segmentos)
    const geometry = new THREE.CylinderGeometry(0.65, 0.65, height, 32);
    
    // Material con un color degradado/atractivo (ej. acento azul/violeta brillante)
    const material = new THREE.MeshStandardMaterial({
      color: index === 0 ? 0xf59e0b : 0x38bdf8, // El #1 dorado, los demás cian
      roughness: 0.3,
      metalness: 0.8
    });

    const cylinder = new THREE.Mesh(geometry, material);
    
    // Posicionar el cilindro (el origen de Three.js es el centro, ajustamos Y para que crezca hacia arriba)
    cylinder.position.set(startX + (index * spacing), height / 2, 0);
    
    // Guardar los datos del video dentro del objeto 3D para recuperarlos al hacer clic
    cylinder.userData = { videoData: video, rank: index + 1 };
    
    scene.add(cylinder);
    cylinders.push(cylinder);
  });

  // 5. Manejo de Clics con Raycaster
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
      
      // Calcular engagement
      const engagement = videoData.vistas > 0 
        ? (((videoData.likes + videoData.comentarios) / videoData.vistas) * 100).toFixed(2) 
        : 0;

      // Actualizar la tarjeta de detalles inferior en el DOM
      detailCard.innerHTML = `
        <div class="detail-content">
          <div class="detail-rank">#${rank} Top Más Visto</div>
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
      
      // Animación sutil de escala al hacer clic
      selectedMesh.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => selectedMesh.scale.set(1, 1, 1), 200);
    }
  }

  renderer.domElement.addEventListener('click', onClick);

  // 6. Bucle de renderizado (animación sutil de rotación o flotación)
  let animationFrameId;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    // Rotación leve de la escena o cilindros para dar dinamismo visual
    cylinders.forEach((cyl, idx) => {
      cyl.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
  }
  animate();

  // 7. Manejo de redimensionamiento de ventana
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}