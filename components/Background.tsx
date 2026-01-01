import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Background: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 检测是否是手机设备
    const isMobile = window.innerWidth < 768;

    // Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile, // 手机上禁用抗锯齿
      powerPreference: "low-power",
      precision: "lowp"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    // 手机上降低像素比，性能优先
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particles - 手机减少50%粒子数量
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const numParticles = isMobile ? 1000 : 2000;
    const colorChoices = [
      new THREE.Color(0xff00ff), // Magenta
      new THREE.Color(0x00ffff), // Cyan
      new THREE.Color(0xffffff), // White
      new THREE.Color(0x9933ff) // Purple
    ];

    for (let i = 0; i < numParticles; i++) {
      const x = 2000 * Math.random() - 1000;
      const y = 2000 * Math.random() - 1000;
      const z = 2000 * Math.random() - 1000;
      vertices.push(x, y, z);

      const color =
        colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // 创建简单的粒子材质，不加载外部纹理
    const material = new THREE.PointsMaterial({
      size: isMobile ? 3 : 4,
      sizeAttenuation: true,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation Loop
    let animationId: number;
    let speed = 2;
    let lastTime = Date.now();
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const now = Date.now();
      const delta = now - lastTime;

      // 限制帧率以节省移动设备电源
      if (delta < frameInterval) return;
      lastTime = now;

      // Rotate the entire system slowly
      particles.rotation.z += 0.001;
      particles.rotation.x += 0.0005;

      // Move particles towards camera to create warp effect
      const positions = particles.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < numParticles; i++) {
        // Z index is at i * 3 + 2
        let z = positions[i * 3 + 2];
        z += speed;

        if (z > 1000) {
          z -= 2000;
        }

        positions[i * 3 + 2] = z;
      }

      particles.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (
        containerRef.current &&
        containerRef.current.contains(renderer.domElement)
      ) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
};

export default Background;
