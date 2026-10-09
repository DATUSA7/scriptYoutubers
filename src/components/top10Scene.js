import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function inicializarTop10Scene(videos) {
  const container = document.getElementById('top10-canvas-container');
  const detailCard = document.getElementById('top10-detail-card');
  
  if (!container || !videos || videos.length === 0) return;

  // 1. Obtener el Top 10 de más vistos
  const top10 = [...videos]
    .sort((a, b) => b.vistas - a.vistas)
    .slice(0, 10);

  // 2. Configuración básica de la escena
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 4, 12); // Posición inicial cómoda

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 3. Añadir OrbitControls para poder orbitar / rotar la escena con el dedo o mouse
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Suaviza el movimiento
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Evita que la cámara baje por debajo del "piso"
  controls.minDistance = 6;
  controls.maxDistance = 20;

  // 4. Iluminación profesional
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 12, 8);
  scene.add(directionalLight);

  // 5. Crear un "Piso" o Plataforma circular debajo de la gráfica
  const floorGeometry = new THREE.CylinderGeometry(8, 8, 0.2, 64);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.1;
  scene.add(floor);

  // 6. Crear los cilindros 3D (Más anchos y con mayor separación para móviles)
  const cylinders = [];
  const maxViews = Math.max(...top10.map(v => v.vistas), 1);
  
  const spacing = 1.5; // Mayor separación horizontal para evitar toques erróneos en celulares
  const startX = -((top10.length - 1) * spacing) / 2;

  top10.forEach((video, index) => {
    const height = Math.max((video.vistas / maxViews) * 4.5, 0.6);
    
    // Radio superior e inferior ensanchado (0.5) para facilitar la selección táctil
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, height, 32);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Azul brillante corporativo
      roughness: 0.2,
      metalness: 0.8
    });

    const cylinder = new THREE.Mesh(geometry, material);
    // Posicionamos el cilindro sobre el piso (height / 2)
    cylinder.position.set(startX + (index * spacing), height / 2, 0);
    
    // Guardar los datos del video en userData
    cylinder.userData = { videoData: video, rank: index + 1 };
    
    scene.add(cylinder);
    cylinders.push(cylinder);
  });

  // 7. Interactividad táctil / clics con Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onPointerDown(event) {
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
          <div class="detail-rank" style="color: #3b82f6;">Top #${rank} más visto</div>
          <h3 class="detail-title">${videoData.titulo}</h3>
          <div class="detail-metrics-grid">
            <div><span>📅 Publicación:</span> <strong>${videoData.fecha}</strong></div>
            <div><span>👁️ Vistas:</span> <strong>${videoData.vistas.toLocaleString()}</strong></div>
            <div><span>❤️ Likes:</span> <strong>${videoData.likes.toLocaleString()}</strong></div>
            <div><span>💬 Comentarios:</span> <strong>${videoData.comentarios.toLocaleString()}</strong></div>
            <div><span>🔥 Engagement:</span> <strong>${engagement}%</strong></div>
          </div>
          <a href="${videoData.enlace}" target="_blank" rel="noopener noreferrer" class="detail-btn" style="background: #3b82f6; color: #ffffff;">Ver Video en YouTube</a>
        </div>
      `;
      
      // Animación sutil de rebote al seleccionar
      selectedMesh.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => selectedMesh.scale.set(1, 1, 1), 250);
    }
  }

  // Usamos pointerdown para que funcione tanto en clics de PC como en toques de pantalla en móviles
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  // 8. Bucle de renderizado actualizado con los controles de órbita
  function animate() {
    requestAnimationFrame(animate);
    
    // Opcional: rotación suave automática de los cilindros sobre su propio eje
    cylinders.forEach((cyl) => {
      cyl.rotation.y += 0.008;
    });

    controls.update(); // Actualizar la órbita de la cámara
    renderer.render(scene, camera);
  }
  animate();

  // 9. Adaptabilidad ante cambios de tamaño de pantalla
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}