import React, { Suspense, useEffect, useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

/* ------------------- Blind Model Component ------------------- */
function BlindModel({
  position = [0, -0.1, 0],
  rotation = [0, 0, 0],
  blindColor = "#4b5563",
  frameColor = "#374151",
  useOriginalColors = true,
  patternType = "none",
  patternIntensity = 0.5,
  blindOpenAmount = 0,
  selectedTexture = "none",
}) {
  const gltf = useGLTF("/blindesss.glb");
  const groupRef = useRef();
  const [textures, setTextures] = useState({});
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [originalColors, setOriginalColors] = useState({});

  const modelConfig = {
    defaultRotation: [0, 0, 0],
    frameDetection: ["rod", "pole", "bar", "metal", "frame", "holder", "rope", "cord", "string"],
    blindDetection: ["blind", "fabric", "cloth", "material", "slat", "object_1", "blade"],
    defaultBlindColor: "#4b5563",
    defaultFrameColor: "#374151",
  };

  useEffect(() => {
    if (gltf.scene) {
      const colors = {};
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const material = child.material;
          const color = material.color ? `#${material.color.getHexString()}` : null;
          colors[child.name] = { color, materialName: material.name, materialType: material.type };
        }
      });
      setOriginalColors(colors);
    }
  }, [gltf.scene]);

  const createPatternTexture = (patternType, color = "#ffffff") => {
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, size, size);
    const primaryColor = color;

    switch (patternType) {
      case "stripes":
        context.fillStyle = primaryColor;
        const stripeWidth = 16;
        for (let i = 0; i < size; i += stripeWidth * 2) {
          context.fillRect(i, 0, stripeWidth, size);
        }
        break;
      default:
        context.fillStyle = primaryColor;
        context.fillRect(0, 0, size, size);
    }

    return new THREE.CanvasTexture(canvas);
  };

  const { clonedScene, scale } = useMemo(() => {
    if (!gltf.scene) return { clonedScene: null, scale: 1 };
    const cloned = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 0.78 / maxDim : 1;
    cloned.position.set(-center.x, -center.y, -center.z);
    return { clonedScene: cloned, scale };
  }, [gltf.scene]);

  useEffect(() => {
    if (!clonedScene || !texturesLoaded) return;
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        if (useOriginalColors) {
          child.material = child.material.clone();
          child.material.needsUpdate = true;
        } else {
          const objectName = child.name.toLowerCase();
          const materialName = child.material?.name?.toLowerCase() || "";
          const isFrame = modelConfig.frameDetection.some(
            (k) => objectName.includes(k) || materialName.includes(k)
          );
          const isBlind = modelConfig.blindDetection.some(
            (k) => objectName.includes(k) || materialName.includes(k)
          );
          if (isFrame) {
            child.material = new THREE.MeshStandardMaterial({
              color: frameColor,
              roughness: 0.4,
              metalness: 0.6,
            });
          } else if (isBlind) {
            child.material = new THREE.MeshStandardMaterial({
              color: blindColor,
              roughness: 0.8,
              metalness: 0.0,
            });
          }
        }
      }
    });
  }, [clonedScene, blindColor, frameColor, useOriginalColors, texturesLoaded]);

  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        if (name.includes("blind") || name.includes("slat") || name.includes("fabric")) {
          const targetScaleY = 1 - blindOpenAmount * 0.95;
          child.scale.y = Math.max(0.05, targetScaleY);
          const originalHeight = 1;
          const scaledHeight = originalHeight * child.scale.y;
          const heightDiff = originalHeight - scaledHeight;
          child.position.y = -heightDiff / 2;
        }
      }
    });
  }, [clonedScene, blindOpenAmount]);

  useEffect(() => {
    if (groupRef.current && scale) {
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [scale, position]);

  if (!clonedScene) return null;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={clonedScene} />
    </group>
  );
}
useGLTF.preload("/blindesss.glb");

/* ------------------- Stable Orbit Controls ------------------- */
function StableOrbitControls(props) {
  const controlsRef = useRef();
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.update();
  }, []);
  return <OrbitControls ref={controlsRef} {...props} />;
}

/* ------------------- Main Blind3D Component ------------------- */
export default function Blind3D() {
  const location = useLocation();
  const [windowImage, setWindowImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  const { selectedCategory } = location.state || {
    selectedCategory: { name: "Window Blinds" },
  };

  useEffect(() => {
    const img = localStorage.getItem("windowPhoto");
    if (img) setWindowImage(img);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white p-4 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-6 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          3D Preview:{" "}
          <span className="bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">
            {selectedCategory?.name}
          </span>
        </motion.h1>
        <motion.p
          className="text-gray-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Interactive 3D Model - Drag to rotate, scroll to zoom
        </motion.p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto flex-1 relative z-10">
        <div className="flex-1 flex flex-col">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-300 shadow-2xl p-4 flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl z-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>
                  <p className="text-gray-700 text-sm font-semibold">Loading 3D Blind...</p>
                </div>
              </div>
            )}

            {windowImage && (
              <img
                src={windowImage}
                alt="Window"
                className="absolute inset-0 w-full h-full object-contain z-0 rounded-xl opacity-80"
              />
            )}

            {/* 3D Model Container with Height Control */}
            <div
              className="relative w-full rounded-xl overflow-hidden transition-all duration-500"
              style={{
                height: isClosed ? "221px" : "412px",
              }}
            >
              {/* Open / Close Buttons */}
              <div className="absolute top-3 right-3 z-20 flex gap-2">
                <button
                  onClick={() => setIsClosed(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    isClosed
                      ? "bg-gray-400 text-gray-600 border-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-white border-gray-600 hover:bg-gray-800"
                  }`}
                  disabled={isClosed}
                >
                  Close
                </button>

                <button
                  onClick={() => setIsClosed(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    !isClosed
                      ? "bg-gray-400 text-gray-600 border-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-white border-gray-600 hover:bg-gray-800"
                  }`}
                  disabled={!isClosed}
                >
                  Open
                </button>
              </div>

              {windowImage ? (
                <div className="absolute inset-0 w-full h-full">
                  <Canvas style={{ width: "100%", height: "760px" }} camera={{ position: [0, 0, 3], fov: 45 }}>
                    <ambientLight intensity={-0.1} />
                    <directionalLight position={[20, 5, 25]} intensity={1} />
                    <Suspense fallback={null}>
                      <BlindModel useOriginalColors={true} position={[0, 0.22   , 0]} />
                      <Environment preset="city" />
                    </Suspense>
                    <StableOrbitControls
                      enableZoom={false}
                      enableRotate={false}
                      enablePan={false}
                      minDistance={1}
                      maxDistance={10}
                      minPolarAngle={Math.PI / 2 - 0.6}
                      maxPolarAngle={Math.PI / 2 + 0.6}
                    />
                  </Canvas>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-xl">
                  <div className="text-center text-gray-700">
                    <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm">No window photo found</p>
                    <p className="text-gray-500 text-xs">Please capture a window image first</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Instructions */}
      <motion.div
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-300 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-3 text-gray-700">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
          <span className="font-medium text-sm">
            Drag to rotate • Scroll to zoom • Showing original 3D model
          </span>
        </div>
      </motion.div>
    </div>
  );
}

const AVAILABLE_TEXTURES = [
  {
    id: "none",
    name: "No Texture",
    description: "Solid color material",
    preview: "bg-gradient-to-br from-gray-600 to-gray-700",
    type: "solid",
  },
];