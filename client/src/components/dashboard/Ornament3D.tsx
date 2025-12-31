import { useEffect, useRef, useState } from "react";

interface Ornament3DProps {
  isMobile?: boolean;
}

export function Ornament3D({ isMobile = false }: Ornament3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const sceneRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Three.js from CDN
    const scripts = [
      "https://esm.sh/three@r128",
      "https://esm.sh/three@r128/examples/jsm/controls/OrbitControls.js",
    ];

    Promise.all(
      scripts.map((src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.type = "module";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      })
    ).then(() => {
      setIsLoaded(true);
      initScene();
    }).catch((e) => {
      console.warn("3D ornament failed to load:", e);
      setIsLoaded(false);
    });
  }, []);

  const initScene = async () => {
    if (!canvasRef.current || isMobile) return;

    try {
      const THREE = (window as any).THREE;
      if (!THREE) return;

      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);

      camera.position.z = 2.5;

      // Create low-poly ornament (icosahedron)
      const geometry = new THREE.IcosahedronGeometry(1, 3);
      const material = new THREE.MeshPhongMaterial({
        color: 0x3b82f6,
        emissive: 0x1e3a8a,
        shininess: 100,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Lighting
      const light1 = new THREE.PointLight(0x3b82f6, 1);
      light1.position.set(5, 5, 5);
      scene.add(light1);

      const light2 = new THREE.PointLight(0x1e40af, 0.5);
      light2.position.set(-5, -5, 5);
      scene.add(light2);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      sceneRef.current = { scene, camera, renderer, mesh };

      // Mouse tracking
      const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = {
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: -(e.clientY / window.innerHeight) * 2 + 1,
        };
      };

      window.addEventListener("mousemove", handleMouseMove);

      // Animation loop
      let frameCount = 0;
      const animate = () => {
        frameCount++;
        requestAnimationFrame(animate);

        // Auto-rotate
        mesh.rotation.x += 0.002;
        mesh.rotation.y += 0.003;

        // Mouse follow (smooth interpolation)
        rotationRef.current.x += (mouseRef.current.y * 0.5 - rotationRef.current.x) * 0.05;
        rotationRef.current.y += (mouseRef.current.x * 0.5 - rotationRef.current.y) * 0.05;

        mesh.rotation.x += rotationRef.current.x * 0.01;
        mesh.rotation.y += rotationRef.current.y * 0.01;

        // Subtle float animation
        mesh.position.y = Math.sin(frameCount * 0.003) * 0.3;

        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        const newWidth = canvasRef.current?.clientWidth || width;
        const newHeight = canvasRef.current?.clientHeight || height;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
      };
    } catch (error) {
      console.warn("3D scene initialization failed:", error);
    }
  };

  if (isMobile || !isLoaded) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 opacity-20 mix-blend-screen"
      style={{ backgroundColor: "transparent" }}
    />
  );
}
