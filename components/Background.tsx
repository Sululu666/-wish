import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const numParticles = 3000;
    const colorChoices = [
      new THREE.Color(0xff00ff), // Magenta
      new THREE.Color(0x00ffff), // Cyan
      new THREE.Color(0xffffff), // White
      new THREE.Color(0x9933ff), // Purple
    ];

    for (let i = 0; i < numParticles; i++) {
      const x = 2000 * Math.random() - 1000;
      const y = 2000 * Math.random() - 1000;
      const z = 2000 * Math.random() - 1000;
      vertices.push(x, y, z);

      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Create a circular texture for particles
    const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

    const material = new THREE.PointsMaterial({
      size: 4,
      sizeAttenuation: true,
      map: sprite,
      alphaTest: 0.5,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation Loop
    let animationId: number;
    let speed = 2;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate the entire system slowly
      particles.rotation.z += 0.001;
      particles.rotation.x += 0.0005;

      // Move particles towards camera to create warp effect
      const positions = particles.geometry.attributes.position.array as Float32Array;

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

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
};

export default Background;
