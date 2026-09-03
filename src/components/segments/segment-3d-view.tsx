'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DrainageSegment } from '@/types';

interface Segment3DViewProps {
  segment: DrainageSegment;
  customWidthCm?: number;
  customDepthCm?: number;
}

export function Segment3DView({ segment, customWidthCm, customDepthCm }: Segment3DViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(2.6, 2.2, 3.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const matColor: Record<string, number> = {
      beton_precast: 0x94a3b8,
      pasangan_batu: 0x78716c,
      tanah: 0x854d0e,
      belum_ada: 0xd97706,
      lainnya: 0x64748b,
    };

    const channelMat = new THREE.MeshStandardMaterial({
      color: matColor[segment.material] || 0x64748b,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const widthCm = customWidthCm ?? segment.width_cm;
    const depthCm = customDepthCm ?? segment.depth_cm;
    const w = Math.max(widthCm / 100, 0.4);
    const h = Math.max(depthCm / 100, 0.3);
    const thick = 0.08;
    const len = 3.0;

    const channelGroup = new THREE.Group();

    // Bottom slab
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w + thick * 2, thick, len), channelMat);
    bMesh.position.set(0, -thick / 2, 0);
    channelGroup.add(bMesh);

    // Walls
    const lMesh = new THREE.Mesh(new THREE.BoxGeometry(thick, h, len), channelMat);
    lMesh.position.set(-w / 2 - thick / 2, h / 2, 0);
    channelGroup.add(lMesh);

    const rMesh = new THREE.Mesh(new THREE.BoxGeometry(thick, h, len), channelMat);
    rMesh.position.set(w / 2 + thick / 2, h / 2, 0);
    channelGroup.add(rMesh);

    // Water Layer
    const waterLevel = h * (segment.condition === 'tersumbat' ? 0.85 : 0.45);
    const waterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.02, waterLevel, len - 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.7, roughness: 0.1 })
    );
    waterMesh.position.set(0, waterLevel / 2, 0);
    channelGroup.add(waterMesh);

    const gridHelper = new THREE.GridHelper(8, 16, 0x334155, 0x1e293b);
    gridHelper.position.y = -thick;
    scene.add(gridHelper);
    scene.add(channelGroup);

    // Mouse drag rotation
    let isDragging = false, prevX = 0;
    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      channelGroup.rotation.y += (e.clientX - prevX) * 0.01;
      prevX = e.clientX;
    };
    const onMouseUp = () => { isDragging = false; };
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (!isDragging) channelGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [segment, customWidthCm, customDepthCm]);

  return (
    <div className="relative w-full h-64 min-h-[256px] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
      <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded text-[10px] text-slate-200 font-mono flex items-center gap-2 border border-slate-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        PENAMPANG 3D SALURAN (DRAG UNTUK ROTASI)
      </div>
      <div className="absolute bottom-2 right-2 z-10 bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-300 font-mono border border-slate-700">
        Lebar: {customWidthCm ?? segment.width_cm}cm | Tinggi: {customDepthCm ?? segment.depth_cm}cm
      </div>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
