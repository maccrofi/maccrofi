// ProductViewer3D – interactive 3D product viewer built with Three.js.
// Supports 360° rotation, zoom, dynamic lighting, color swatches, and material inspection.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useCart } from '../context/CartContext';

export default function ProductViewer3D({ product, onClose, isModal = false }) {
  const mountRef = useRef(null);
  const { addToCart } = useCart();

  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || '#1a1a1a'
  );
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightingPreset, setLightingPreset] = useState('studio'); // 'studio' | 'warm' | 'dramatic'
  const [isAdded, setIsAdded] = useState(false);

  // References to 3D scene objects to allow dynamic updates
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const mainMeshGroupRef = useRef(null);
  const lightsGroupRef = useRef(null);
  const materialsRef = useRef([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 3.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.8;
    controls.maxDistance = 6.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Prevent going beneath floor
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // 4. Lighting Group
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;
    updateLighting(lightingPreset, lightsGroup);

    // 5. Floor shadow plane (soft ambient contact shadow)
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Build Procedural Fashion Model based on modelType
    const modelGroup = new THREE.Group();
    materialsRef.current = [];

    const type = product?.modelType || 'handbag';
    if (type === 'crochet-bag') {
      createCrochetBagModel(modelGroup, selectedColor, materialsRef.current);
    } else if (type === 'handbag') {
      createHandbagModel(modelGroup, selectedColor, materialsRef.current);
    } else if (type === 'sweater') {
      createSweaterModel(modelGroup, selectedColor, materialsRef.current);
    } else if (type === 'top') {
      createTopModel(modelGroup, selectedColor, materialsRef.current);
    } else {
      createHairClawModel(modelGroup, selectedColor, materialsRef.current);
    }

    scene.add(modelGroup);
    mainMeshGroupRef.current = modelGroup;

    // 7. Render Loop
    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // 8. Handle Resize
    function handleResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [product]);

  // Update dynamic color
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      if (mat.name === 'primary') {
        mat.color.set(selectedColor);
      }
    });
  }, [selectedColor]);

  // Update wireframe mode
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      mat.wireframe = wireframe;
    });
  }, [wireframe]);

  // Update auto rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update lighting preset
  useEffect(() => {
    if (lightsGroupRef.current) {
      updateLighting(lightingPreset, lightsGroupRef.current);
    }
  }, [lightingPreset]);

  function handleAdd() {
    addToCart(product, true);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className={`viewer-3d-root ${isModal ? 'viewer-3d-modal' : 'viewer-3d-inline'}`}>
      {isModal && (
        <div className="viewer-3d-backdrop" onClick={onClose} />
      )}

      <div className="viewer-3d-container">
        {/* Top Header */}
        <div className="viewer-3d-header">
          <div className="viewer-3d-title-group">
            <span className="viewer-badge">INTERACTIVE 3D STUDIO</span>
            <h3>{product?.name || 'MacCroFi 3D Inspection'}</h3>
          </div>
          {isModal && (
            <button className="viewer-close-btn" onClick={onClose} aria-label="Close 3D viewer">
              ✕
            </button>
          )}
        </div>

        {/* 3D WebGL Canvas Mount */}
        <div className="viewer-canvas-wrap">
          <div ref={mountRef} className="three-canvas-mount" />

          {/* Interactive Hint */}
          <div className="viewer-canvas-overlay-hint">
            <span>Drag to rotate • Scroll to zoom</span>
          </div>

          {/* Floating Controls Toolbar */}
          <div className="viewer-toolbar">
            <button
              className={`viewer-tool-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate(!autoRotate)}
              title="Toggle Auto Rotation"
            >
              🔄 {autoRotate ? 'Rotating' : 'Paused'}
            </button>
            <button
              className={`viewer-tool-btn ${wireframe ? 'active' : ''}`}
              onClick={() => setWireframe(!wireframe)}
              title="Toggle Wireframe inspection"
            >
              🕸️ {wireframe ? 'Solid' : 'Wireframe'}
            </button>
            <div className="lighting-preset-pills">
              <button
                className={`preset-pill ${lightingPreset === 'studio' ? 'active' : ''}`}
                onClick={() => setLightingPreset('studio')}
              >
                Studio
              </button>
              <button
                className={`preset-pill ${lightingPreset === 'warm' ? 'active' : ''}`}
                onClick={() => setLightingPreset('warm')}
              >
                Warm
              </button>
              <button
                className={`preset-pill ${lightingPreset === 'dramatic' ? 'active' : ''}`}
                onClick={() => setLightingPreset('dramatic')}
              >
                Noir
              </button>
            </div>
          </div>
        </div>

        {/* Customization & Action Panel */}
        <div className="viewer-3d-controls-panel">
          <div className="viewer-color-section">
            <span className="control-label">Select Fabric / Leather Shade:</span>
            <div className="color-swatches-row">
              {product?.colors?.map((hex, idx) => (
                <button
                  key={hex}
                  className={`color-swatch-btn ${selectedColor === hex ? 'active' : ''}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => setSelectedColor(hex)}
                  title={product?.colorNames?.[idx] || hex}
                >
                  {selectedColor === hex && <span className="swatch-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="viewer-action-row">
            <div className="viewer-price-info">
              <span className="price-tag">₹{product?.price?.toLocaleString('en-IN')}</span>
              <span className="stock-hint">In stock • Ready for dispatch</span>
            </div>
            <button className="btn btn-primary viewer-add-btn" onClick={handleAdd}>
              {isAdded ? '✓ Added to Bag' : '+ Add to Bag'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lighting Setup Helper ─────────────────────────────────
function updateLighting(preset, group) {
  group.clear();

  if (preset === 'warm') {
    const amb = new THREE.AmbientLight(0xfff3e0, 1.2);
    const key = new THREE.DirectionalLight(0xffb74d, 2.2);
    key.position.set(3, 4, 3);
    key.castShadow = true;
    const fill = new THREE.DirectionalLight(0xff8a65, 1.0);
    fill.position.set(-3, 1, -2);
    group.add(amb, key, fill);
  } else if (preset === 'dramatic') {
    const amb = new THREE.AmbientLight(0x222233, 0.6);
    const key = new THREE.SpotLight(0xffffff, 4.0);
    key.position.set(2, 5, 2.5);
    key.angle = Math.PI / 4;
    key.penumbra = 0.5;
    key.castShadow = true;
    const rim = new THREE.DirectionalLight(0x90caf9, 2.5);
    rim.position.set(-2, 3, -3);
    group.add(amb, key, rim);
  } else {
    // Studio Clean Lighting
    const amb = new THREE.AmbientLight(0xffffff, 1.4);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;
    const fill = new THREE.DirectionalLight(0xf0f4f8, 1.2);
    fill.position.set(-4, 2, -2);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
    backLight.position.set(0, 4, -4);
    group.add(amb, key, fill, backLight);
  }
}

// ── 3D Procedural Model Generators ────────────────────────

// Helper to generate procedural crochet yarn loop bump texture
function getCrochetBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);

  // Draw knit stitch loops pattern
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 3;
  for (let y = 0; y < 128; y += 16) {
    for (let x = 0; x < 128; x += 16) {
      ctx.beginPath();
      ctx.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(x + 12, y + 12);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

// 0. Handcrafted Crochet Hobo Shoulder Bag (Sage MacCroFi Signature)
function createCrochetBagModel(group, colorHex, materialsList) {
  const crochetMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.95,
    metalness: 0.0,
    bumpMap: getCrochetBumpTexture(),
    bumpScale: 0.04,
    name: 'primary',
  });
  materialsList.push(crochetMat);

  // Slouchy Hobo silhouette with deep V-center dip and rising shoulder peaks
  const bagShape = new THREE.Shape();
  bagShape.moveTo(0, -0.65); // bottom center
  bagShape.quadraticCurveTo(-0.6, -0.65, -0.65, -0.1); // bottom-left curve
  bagShape.lineTo(-0.55, 0.45); // left peak rising to strap
  bagShape.quadraticCurveTo(-0.25, 0.05, 0, 0.0); // deep V dip into center
  bagShape.quadraticCurveTo(0.25, 0.05, 0.55, 0.45); // right peak rising to strap
  bagShape.lineTo(0.65, -0.1); // right edge
  bagShape.quadraticCurveTo(0.6, -0.65, 0, -0.65); // bottom-right curve

  const extrudeSettings = {
    steps: 2,
    depth: 0.24,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.08,
    bevelOffset: 0,
    bevelSegments: 5,
  };

  const bagGeo = new THREE.ExtrudeGeometry(bagShape, extrudeSettings);
  bagGeo.center();
  const bagMesh = new THREE.Mesh(bagGeo, crochetMat);
  bagMesh.position.y = -0.25;
  bagMesh.castShadow = true;
  bagMesh.receiveShadow = true;
  group.add(bagMesh);

  // Long Slender Crochet Shoulder Strap
  const strapCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.46, 0.15, 0),
    new THREE.Vector3(-0.4, 0.7, 0),
    new THREE.Vector3(-0.15, 1.45, 0),
    new THREE.Vector3(0.15, 1.45, 0),
    new THREE.Vector3(0.4, 0.7, 0),
    new THREE.Vector3(0.46, 0.15, 0),
  ]);
  const strapGeo = new THREE.TubeGeometry(strapCurve, 32, 0.032, 10, false);
  const strapMesh = new THREE.Mesh(strapGeo, crochetMat);
  strapMesh.castShadow = true;
  group.add(strapMesh);
}

// 1. Handbag Model
function createHandbagModel(group, colorHex, materialsList) {
  // Main Bag Body (Curved architectural silhouette)
  const bodyGeo = new THREE.CylinderGeometry(0.75, 0.85, 0.9, 32, 8);
  bodyGeo.scale(1.1, 1.0, 0.55);

  const leatherMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.45,
    metalness: 0.08,
    name: 'primary',
  });
  materialsList.push(leatherMat);

  const bodyMesh = new THREE.Mesh(bodyGeo, leatherMat);
  bodyMesh.position.y = -0.15;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Gold Metal Trim & Logo Plaque
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.9,
  });
  materialsList.push(goldMat);

  // Logo plate
  const plateGeo = new THREE.BoxGeometry(0.24, 0.1, 0.02);
  const plateMesh = new THREE.Mesh(plateGeo, goldMat);
  plateMesh.position.set(0, -0.1, 0.29);
  group.add(plateMesh);

  // Top Zipper / Rim
  const rimGeo = new THREE.TorusGeometry(0.72, 0.03, 16, 32);
  rimGeo.scale(1.1, 0.55, 1.0);
  const rimMesh = new THREE.Mesh(rimGeo, goldMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = 0.3;
  group.add(rimMesh);

  // Looped Leather Shoulder Strap
  const strapCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.75, 0.28, 0),
    new THREE.Vector3(-0.85, 0.95, 0),
    new THREE.Vector3(-0.4, 1.35, 0),
    new THREE.Vector3(0.4, 1.35, 0),
    new THREE.Vector3(0.85, 0.95, 0),
    new THREE.Vector3(0.75, 0.28, 0),
  ]);
  const strapGeo = new THREE.TubeGeometry(strapCurve, 32, 0.045, 12, false);
  const strapMesh = new THREE.Mesh(strapGeo, leatherMat);
  strapMesh.castShadow = true;
  group.add(strapMesh);

  // Strap Buckles
  const buckleGeo = new THREE.TorusGeometry(0.07, 0.02, 12, 24);
  const leftBuckle = new THREE.Mesh(buckleGeo, goldMat);
  leftBuckle.position.set(-0.76, 0.3, 0);
  const rightBuckle = leftBuckle.clone();
  rightBuckle.position.set(0.76, 0.3, 0);
  group.add(leftBuckle, rightBuckle);
}

// 2. Sweater Model
function createSweaterModel(group, colorHex, materialsList) {
  const knitMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.85,
    metalness: 0.02,
    name: 'primary',
  });
  materialsList.push(knitMat);

  // Torso / Sweater Body
  const bodyGeo = new THREE.CylinderGeometry(0.68, 0.62, 1.15, 32);
  bodyGeo.scale(1.1, 1.0, 0.7);
  const bodyMesh = new THREE.Mesh(bodyGeo, knitMat);
  bodyMesh.position.y = -0.15;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Turtleneck / Collar Rib
  const collarGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.35, 32);
  const collarMesh = new THREE.Mesh(collarGeo, knitMat);
  collarMesh.position.y = 0.5;
  collarMesh.castShadow = true;
  group.add(collarMesh);

  // Left & Right Sleeves
  const sleeveGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.95, 24);

  const leftSleeve = new THREE.Mesh(sleeveGeo, knitMat);
  leftSleeve.position.set(-0.82, 0.05, 0);
  leftSleeve.rotation.z = Math.PI / 6;
  leftSleeve.castShadow = true;

  const rightSleeve = new THREE.Mesh(sleeveGeo, knitMat);
  rightSleeve.position.set(0.82, 0.05, 0);
  rightSleeve.rotation.z = -Math.PI / 6;
  rightSleeve.castShadow = true;

  group.add(leftSleeve, rightSleeve);

  // Hem rib bottom
  const hemGeo = new THREE.TorusGeometry(0.64, 0.04, 16, 32);
  hemGeo.scale(1.1, 0.7, 1);
  const hemMesh = new THREE.Mesh(hemGeo, knitMat);
  hemMesh.rotation.x = Math.PI / 2;
  hemMesh.position.y = -0.72;
  group.add(hemMesh);
}

// 3. Top Model (Sleeveless / Halter silhouette)
function createTopModel(group, colorHex, materialsList) {
  const silkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.35,
    metalness: 0.12,
    name: 'primary',
  });
  materialsList.push(silkMat);

  // Fitted Bodice
  const topGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.9, 32);
  topGeo.scale(1.05, 1.0, 0.65);
  const topMesh = new THREE.Mesh(topGeo, silkMat);
  topMesh.position.y = -0.1;
  topMesh.castShadow = true;
  group.add(topMesh);

  // Sculpted Halter Neck
  const strapCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 0.35, 0.1),
    new THREE.Vector3(-0.18, 0.75, 0.02),
    new THREE.Vector3(0, 0.85, -0.05),
  ]);
  const strapCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.35, 0.35, 0.1),
    new THREE.Vector3(0.18, 0.75, 0.02),
    new THREE.Vector3(0, 0.85, -0.05),
  ]);

  const strapGeoL = new THREE.TubeGeometry(strapCurveL, 20, 0.03, 10, false);
  const strapGeoR = new THREE.TubeGeometry(strapCurveR, 20, 0.03, 10, false);
  const strapMeshL = new THREE.Mesh(strapGeoL, silkMat);
  const strapMeshR = new THREE.Mesh(strapGeoR, silkMat);
  group.add(strapMeshL, strapMeshR);
}

// 4. Hair Claw Clip Model
function createHairClawModel(group, colorHex, materialsList) {
  // Translucent Pearl / Acrylic Body
  const clipMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.2,
    metalness: 0.05,
    transmission: 0.6,
    thickness: 0.8,
    name: 'primary',
  });
  materialsList.push(clipMat);

  // Left & Right Curved Claw Wings
  const wingGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 32, Math.PI * 0.85);
  const leftWing = new THREE.Mesh(wingGeo, clipMat);
  leftWing.rotation.set(0, Math.PI / 6, Math.PI / 4);
  leftWing.position.set(-0.25, 0, 0);
  leftWing.castShadow = true;

  const rightWing = new THREE.Mesh(wingGeo, clipMat);
  rightWing.rotation.set(0, -Math.PI / 6, -Math.PI / 4);
  rightWing.position.set(0.25, 0, 0);
  rightWing.castShadow = true;
  group.add(leftWing, rightWing);

  // Golden Central Spring & Pin
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.2,
  });
  materialsList.push(goldMat);

  const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16);
  const pinMesh = new THREE.Mesh(pinGeo, goldMat);
  pinMesh.rotation.x = Math.PI / 2;
  pinMesh.position.set(0, 0.1, 0);
  group.add(pinMesh);

  // Interlocking teeth
  for (let i = -3; i <= 3; i++) {
    const toothGeo = new THREE.ConeGeometry(0.04, 0.2, 12);
    const tooth = new THREE.Mesh(toothGeo, clipMat);
    tooth.position.set(i * 0.09, -0.25, (i % 2 === 0 ? 0.08 : -0.08));
    tooth.rotation.x = i % 2 === 0 ? 0.3 : -0.3;
    group.add(tooth);
  }
}
