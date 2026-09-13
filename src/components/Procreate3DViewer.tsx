import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  X,
  Maximize2,
  Sun,
  Camera,
  Download,
  RotateCw,
  Layers,
  Sparkles,
  Upload,
  Box,
  Palette
} from 'lucide-react';

interface Procreate3DViewerProps {
  isOpen: boolean;
  onClose: () => void;
  canvasTextureSource?: HTMLCanvasElement | null;
  currentColor: string;
}

type ModelType = 'bust' | 'sphere' | 'mug' | 'cube' | 'skateboard';
type LightingMode = 'studio' | 'sunlight' | 'neon' | 'night';

export function Procreate3DViewer({
  isOpen,
  onClose,
  canvasTextureSource,
  currentColor,
}: Procreate3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelType, setModelType] = useState<ModelType>('sphere');
  const [lighting, setLighting] = useState<LightingMode>('studio');
  const [autoRotate, setAutoRotate] = useState(false);
  const [isTextureApplied, setIsTextureApplied] = useState(true);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    dir1: THREE.DirectionalLight;
    dir2: THREE.DirectionalLight;
  } | null>(null);

  // Mouse orbit state
  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const rotationEuler = useRef({ x: 0.2, y: 0.3 });
  const cameraDistance = useRef(4.5);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101318);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraDistance.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 10, 7);
    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-5, -5, -3);

    scene.add(ambientLight);
    scene.add(dirLight1);
    scene.add(dirLight2);

    lightsRef.current = {
      ambient: ambientLight,
      dir1: dirLight1,
      dir2: dirLight2,
    };

    // 5. Build 3D Mesh
    buildMesh(modelType);

    // 6. Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && meshRef.current) {
        rotationEuler.current.y += 0.008;
      }

      if (meshRef.current) {
        meshRef.current.rotation.x = rotationEuler.current.x;
        meshRef.current.rotation.y = rotationEuler.current.y;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const resizeObs = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObs.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isOpen]);

  // Update lighting mode
  useEffect(() => {
    if (!lightsRef.current || !sceneRef.current) return;
    const { ambient, dir1, dir2 } = lightsRef.current;

    if (lighting === 'studio') {
      sceneRef.current.background = new THREE.Color(0x12151c);
      ambient.color.setHex(0xffffff);
      ambient.intensity = 0.8;
      dir1.color.setHex(0xffffff);
      dir1.intensity = 1.4;
      dir1.position.set(5, 8, 5);
      dir2.color.setHex(0x94a3b8);
      dir2.intensity = 0.5;
    } else if (lighting === 'sunlight') {
      sceneRef.current.background = new THREE.Color(0x181716);
      ambient.color.setHex(0xffecd2);
      ambient.intensity = 0.6;
      dir1.color.setHex(0xffaa44);
      dir1.intensity = 2.0;
      dir1.position.set(8, 12, 4);
      dir2.color.setHex(0x38bdf8);
      dir2.intensity = 0.4;
    } else if (lighting === 'neon') {
      sceneRef.current.background = new THREE.Color(0x0a0c14);
      ambient.color.setHex(0x1e1b4b);
      ambient.intensity = 0.4;
      dir1.color.setHex(0xec4899);
      dir1.intensity = 2.2;
      dir1.position.set(-6, 5, 4);
      dir2.color.setHex(0x06b6d4);
      dir2.intensity = 2.2;
      dir2.position.set(6, -4, 4);
    } else if (lighting === 'night') {
      sceneRef.current.background = new THREE.Color(0x06080d);
      ambient.color.setHex(0x0f172a);
      ambient.intensity = 0.3;
      dir1.color.setHex(0x38bdf8);
      dir1.intensity = 1.2;
      dir1.position.set(4, 8, 3);
      dir2.color.setHex(0x1e293b);
      dir2.intensity = 0.2;
    }
  }, [lighting]);

  // Build 3D Mesh with canvas texture
  const buildMesh = (type: ModelType) => {
    if (!sceneRef.current) return;
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
    }

    let geometry: THREE.BufferGeometry;

    if (type === 'sphere') {
      geometry = new THREE.SphereGeometry(1.6, 64, 64);
    } else if (type === 'cube') {
      geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
    } else if (type === 'bust') {
      // Procedural stylized bust mannequin geometry
      geometry = new THREE.CylinderGeometry(0.8, 1.4, 2.8, 32);
    } else if (type === 'mug') {
      geometry = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 32);
    } else {
      // Skateboard
      geometry = new THREE.BoxGeometry(3.5, 0.15, 1.0);
    }

    let material: THREE.Material;

    if (isTextureApplied && canvasTextureSource) {
      const texture = new THREE.CanvasTexture(canvasTextureSource);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.1,
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(currentColor || '#ffffff'),
        roughness: 0.3,
        metalness: 0.1,
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    sceneRef.current.add(mesh);
    meshRef.current = mesh;
  };

  // Switch model
  const handleSelectModel = (type: ModelType) => {
    setModelType(type);
    buildMesh(type);
  };

  // Custom OBJ file loader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sceneRef.current) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      // Parse basic OBJ vertices and faces
      try {
        const lines = content.split('\n');
        const vertices: number[] = [];
        const rawVerts: [number, number, number][] = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('v ')) {
            const parts = trimmed.split(/\s+/).slice(1).map(Number);
            rawVerts.push([parts[0], parts[1], parts[2]]);
          } else if (trimmed.startsWith('f ')) {
            const parts = trimmed.split(/\s+/).slice(1);
            const indices = parts.map((p) => parseInt(p.split('/')[0], 10) - 1);
            // triangulate fan
            for (let i = 1; i < indices.length - 1; i++) {
              const v0 = rawVerts[indices[0]];
              const v1 = rawVerts[indices[i]];
              const v2 = rawVerts[indices[i + 1]];
              if (v0 && v1 && v2) {
                vertices.push(...v0, ...v1, ...v2);
              }
            }
          }
        }

        if (vertices.length > 0) {
          const geom = new THREE.BufferGeometry();
          geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          geom.computeVertexNormals();
          geom.center();

          let mat: THREE.Material;
          if (isTextureApplied && canvasTextureSource) {
            const tex = new THREE.CanvasTexture(canvasTextureSource);
            mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
          } else {
            mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
          }

          if (meshRef.current) sceneRef.current.remove(meshRef.current);
          const newMesh = new THREE.Mesh(geom, mat);
          sceneRef.current.add(newMesh);
          meshRef.current = newMesh;
        }
      } catch (err) {
        console.error('Failed to parse 3D OBJ file:', err);
      }
    };
    reader.readAsText(file);
  };

  // Export 3D Snapshot
  const handleExportSnapshot = () => {
    if (!rendererRef.current) return;
    const url = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `3d_render_${modelType}.png`;
    a.click();
  };

  // Mouse drag to rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - prevMousePos.current.x;
    const dy = e.clientY - prevMousePos.current.y;
    rotationEuler.current.y += dx * 0.008;
    rotationEuler.current.x += dy * 0.008;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Wheel to zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraDistance.current = Math.max(2, Math.min(10, cameraDistance.current + e.deltaY * 0.005));
    cameraRef.current.position.z = cameraDistance.current;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-[#12151c] border border-[#272d3c] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="h-13 border-b border-[#252b39] px-5 flex items-center justify-between bg-[#0e1015] shrink-0">
          <div className="flex items-center gap-2">
            <Box size={18} className="text-sky-400" />
            <span className="text-sm font-bold text-white tracking-wide">
              Estúdio 3D Procreate
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 font-semibold uppercase">
              Pintura & Iluminação 360°
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202636] hover:bg-sky-600 hover:text-white text-xs font-semibold transition"
            >
              <Camera size={14} />
              <span>Capturar 3D</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202532] transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 3D Viewport & Toolbar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main 3D Canvas */}
          <div
            ref={mountRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className="flex-1 h-full cursor-grab active:cursor-grabbing relative overflow-hidden bg-[#0d0f14]"
          >
            <div className="absolute top-3 left-3 pointer-events-none bg-[#141720]/80 border border-[#252c3c] px-2.5 py-1 rounded-full text-[11px] text-slate-400">
              Arraste para girar em 360° • Role para dar zoom
            </div>
          </div>

          {/* Right Sidebar Controls */}
          <div className="w-72 border-l border-[#242a38] bg-[#12141a] p-4 flex flex-col justify-between overflow-y-auto space-y-4 shrink-0 text-xs">
            <div className="space-y-4">
              {/* Models */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Modelos 3D Nativos
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'sphere', label: 'Esfera Estúdio' },
                    { id: 'cube', label: 'Cubo 3D' },
                    { id: 'bust', label: 'Manequim' },
                    { id: 'mug', label: 'Caneca' },
                    { id: 'skateboard', label: 'Skate' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectModel(m.id as ModelType)}
                      className={`p-2 rounded-xl border text-center transition font-medium ${
                        modelType === m.id
                          ? 'bg-sky-500 text-white font-bold border-sky-400'
                          : 'bg-[#181c25] text-slate-300 border-[#262c3a] hover:border-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Ambiente de Iluminação
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'studio', label: 'Estúdio Neutro' },
                    { id: 'sunlight', label: 'Luz Solar Quente' },
                    { id: 'neon', label: 'Cyberpunk Neon' },
                    { id: 'night', label: 'Luz da Lua' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLighting(l.id as LightingMode)}
                      className={`p-2 rounded-xl border text-center transition font-medium ${
                        lighting === l.id
                          ? 'bg-violet-600 text-white font-bold border-violet-400'
                          : 'bg-[#181c25] text-slate-300 border-[#262c3a] hover:border-slate-400'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Texture Wrap Switch */}
              <div className="p-3 rounded-xl bg-[#181c25] border border-[#262c3a] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Projetar Tela Atual</span>
                  <button
                    onClick={() => {
                      setIsTextureApplied(!isTextureApplied);
                      setTimeout(() => buildMesh(modelType), 20);
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      isTextureApplied ? 'bg-sky-500' : 'bg-[#293040]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isTextureApplied ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Envolve o modelo 3D diretamente com a sua pintura digital.
                </p>
              </div>

              {/* Auto rotate toggle */}
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  autoRotate
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-[#181c25] text-slate-300 border-[#262c3a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <RotateCw size={14} className={autoRotate ? 'animate-spin' : ''} />
                  <span>Rotação Automática</span>
                </div>
                <span className="text-[10px]">{autoRotate ? 'Ativo' : 'Parado'}</span>
              </button>
            </div>

            {/* Upload Custom OBJ */}
            <div className="pt-3 border-t border-[#232936]">
              <label className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#202738] hover:bg-[#2b344a] text-slate-200 cursor-pointer transition border border-[#2f394f]">
                <Upload size={14} className="text-sky-400" />
                <span className="font-semibold">Importar Modelo .OBJ</span>
                <input
                  type="file"
                  accept=".obj"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
