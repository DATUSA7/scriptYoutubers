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

  // 2. Configuración de la escena
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 4, 12);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 3. Crear un elemento HTML flotante para el Tooltip
  const tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.background = 'rgba(15, 23, 42, 0.9)';
  tooltip.style.color = '#ffffff';
  tooltip.style.padding = '6px 10px';
  tooltip.style.borderRadius = '6px';
  tooltip.style.fontSize = '0.8rem';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.display = 'none';
  tooltip.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  tooltip.style.zIndex = '10';
  container.style.position = 'relative';
  container.appendChild(tooltip);

  // 4. OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.minDistance = 6;
  controls.maxDistance = 20;

  // 5. Iluminación
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 12, 8);
  scene.add(directionalLight);

  // 6. Piso circular
  const floorGeometry = new THREE.CylinderGeometry(8, 8, 0.2, 64);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.1;
  scene.add(floor);

  // 7. Crear los cilindros 3D con datos de animación para que "emerjan"
  const cylinders = [];
  const maxViews = Math.max(...top10.map(v => v.vistas), 1);
  
  const spacing = 1.5;
  const startX = -((top10.length - 1) * spacing) / 2;

  top10.forEach((video, index) => {
    const targetHeight = Math.max((video.vistas / maxViews) * 4.5, 0.6);
    
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, targetHeight, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.2,
      metalness: 0.8
    });

    const cylinder = new THREE.Mesh(geometry, material);
    
    // Animación inicial: Empezamos con altura 0.01 (hundidos en el piso) para hacer el efecto de emergencia
    cylinder.position.set(startX + (index * spacing), 0, 0);
    cylinder.scale.set(1, 0.01, 1);
    
    cylinder.userData = { 
      videoData: video, 
      rank: index + 1,
      targetHeight: targetHeight,
      currentAnimProgress: 0 // Control de animación de subida
    };
    
    scene.add(cylinder);
    cylinders.push(cylinder);
  });

  // 8. Raycaster para Detección de Hover (Tooltip) y Clics
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredCylinder = null;

  function onPointerMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cylinders);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object;
      if (hoveredCylinder !== intersectedMesh) {
        hoveredCylinder = intersectedMesh;
        document.body.style.cursor = 'pointer';
      }

      // Mostrar Tooltip con el título del video y sus vistas
      tooltip.style.display = 'block';
      tooltip.style.left = `${event.clientX - rect.left + 15}px`;
      tooltip.style.top = `${event.clientY - rect.top - 25}px`;
      tooltip.innerHTML = `<strong>#${intersectedMesh.userData.rank}</strong>: ${intersectedMesh.userData.videoData.titulo.substring(0, 30)}... (${intersectedMesh.userData.videoData.vistas.toLocaleString()} vistas)`;
    } else {
      hoveredCylinder = null;
      document.body.style.cursor = 'default';
      tooltip.style.display = 'none';
    }
  }

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
      
      selectedMesh.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => selectedMesh.scale.set(1, 1, 1), 250);
    }
  }

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  // 9. Bucle de Animación (Efecto de emergencia de cilindros + rotación suave + órbita)
  function animate() {
    requestAnimationFrame(animate);

    cylinders.forEach((cyl) => {
      // Animación de emergencia fluida al cargar la sección
      if (cyl.userData.currentAnimProgress < 1) {
        cyl.userData.currentAnimProgress += 0.03; // Velocidad de subida
        const progress = Math.min(cyl.userData.currentAnimProgress, 1);
        
        // Efecto "easeOut" para que la subida sea elegante
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentH = cyl.userData.targetHeight * easeProgress;
        cyl.scale.set(1, easeProgress, 1);
        cyl.position.y = currentH / 2;
      }

      // Rotación suave individual sobre su eje
      cyl.rotation.y += 0.008;
    });

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // 10. Resize
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}