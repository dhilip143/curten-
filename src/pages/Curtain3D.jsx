import React, { Suspense, useEffect, useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Palette, 
  ArrowLeft, 
  Download, 
  Share2, 
  ChevronUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Move,
  ArrowUp,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  RotateCcw,
  Settings,
  Circle,
  Eye,
  EyeOff,
  Zap,
  Minus,
  Plus,
  Image
} from "lucide-react";

/* ------------------- Utility Function ------------------- */
const cn = (...classes) => classes.filter(Boolean).join(" ");

/* ------------------- Texture Loader ------------------- */
function loadTexture(path) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.encoding = THREE.sRGBEncoding;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error("Failed to load texture:", path, error);
        reject(error);
      }
    );
  });
}

/* ------------------- Available Textures ------------------- */
const AVAILABLE_TEXTURES = [
  {
    id: "none",
    name: "No Texture",
    description: "Solid color material",
    preview: "bg-gradient-to-br from-gray-600 to-gray-700",
    type: "solid"
  },
  {
    id: "polar_fleece",
    name: "Polar Fleece",
    description: "Soft fleece texture",
    diffuse: "/textures/polar_fleece_diff_4k.jpg",
    normal: "/textures/polar_fleece_normal_4k.jpg",
    roughness: "/textures/polar_fleece_roughness_4k.jpg",
    preview: "bg-gradient-to-br from-gray-500 to-gray-700",
    type: "fabric"
  },
  {
    id: "cotton",
    name: "Cotton",
    description: "Natural cotton fabric",
    diffuse: "/textures/hessian_230_diff_4k.jpg",
    normal: "/textures/hessian_230_diff_4k.jpg",
    roughness: "/textures/hessian_230_diff_4k.jpg",
    preview: "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800",
    type: "fabric"
  },
  {
    id: "silk",
    name: "Silk",
    description: "Luxurious silk material",
    diffuse: "/textures/polar_fleece_anisotropy_strength_4k.png",
    preview: "bg-gradient-to-br from-gray-400 to-gray-600",
    type: "fabric"
  },
  {
    id: "linen",
    name: "Linen",
    description: "Natural linen texture",
    diffuse: "/textures/polar_fleece_anisotropy_strength_4k.png",
    preview: "bg-gradient-to-br from-gray-400 to-gray-600 text-gray-800",
    type: "fabric"
  }
];

/* ------------------- Pattern Textures ------------------- */
function createPatternTexture(patternType, color = "#ffffff") {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, size, size);
  const primaryColor = color;
  const secondaryColor = '#ffffff';

  switch (patternType) {
    case 'floral':
      context.fillStyle = primaryColor;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const x = i * 64 + 32;
          const y = j * 64 + 32;
          context.beginPath();
          context.arc(x, y, 8, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          for (let k = 0; k < 6; k++) {
            const angle = (k / 6) * Math.PI * 2;
            const petalX = x + Math.cos(angle) * 20;
            const petalY = y + Math.sin(angle) * 20;
            context.moveTo(x, y);
            context.arc(petalX, petalY, 6, 0, Math.PI * 2);
          }
          context.fill();
        }
      }
      break;

    case 'geometric':
      context.fillStyle = primaryColor;
      const tileSize = 32;
      for (let i = 0; i < size / tileSize; i++) {
        for (let j = 0; j < size / tileSize; j++) {
          if ((i + j) % 2 === 0) {
            context.beginPath();
            context.moveTo(i * tileSize + tileSize/2, j * tileSize);
            context.lineTo(i * tileSize + tileSize, j * tileSize + tileSize/2);
            context.lineTo(i * tileSize + tileSize/2, j * tileSize + tileSize);
            context.lineTo(i * tileSize, j * tileSize + tileSize/2);
            context.closePath();
            context.fill();
          }
        }
      }
      break;

    case 'stripes':
      context.fillStyle = primaryColor;
      const stripeWidth = 16;
      for (let i = 0; i < size; i += stripeWidth * 2) {
        context.fillRect(i, 0, stripeWidth, size);
      }
      break;

    case 'polka':
      context.fillStyle = primaryColor;
      const dotSize = 12;
      const dotSpacing = 32;
      for (let i = 0; i < size; i += dotSpacing) {
        for (let j = 0; j < size; j += dotSpacing) {
          context.beginPath();
          context.arc(i + dotSpacing/2, j + dotSpacing/2, dotSize/2, 0, Math.PI * 2);
          context.fill();
        }
      }
      break;

    default:
      context.fillStyle = primaryColor;
      context.fillRect(0, 0, size, size);
  }

  return new THREE.CanvasTexture(canvas);
}

/* ------------------- Model Debugger Component ------------------- */
function ModelDebugger({ model }) {
  useEffect(() => {
    if (!model) return;
    
    console.log("=== CURTAIN MODEL STRUCTURE DEBUG ===");
    let meshCount = 0;
    model.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        console.log(`Mesh ${meshCount}:`, {
          name: child.name,
          materialName: child.material?.name,
          materialType: child.material?.type,
          userData: child.userData
        });
      }
    });
    console.log(`Total meshes: ${meshCount}`);
  }, [model]);

  return null;
}

/* ------------------- Curtain Model Component ------------------- */
function CurtainModel({ 
  position = [0, 0, 0], 
  rotation = [0, Math.PI / 2, 0], 
  curtainColor = "#6b7280",
  rodColor = "#8b4513",
  foldProgress = 0,
  foldDirection = "up",
  useOriginalColors = false,
  patternType = "none",
  patternIntensity = 0.5,
  selectedTexture = "none"
}) {
  const gltf = useGLTF("/3d_curtain/scene.gltf");
  const groupRef = useRef();
  const meshRef = useRef();
  const [textures, setTextures] = useState({});
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  const modelConfig = {
    defaultRotation: [0, Math.PI / 2, 0],
    rodDetection: ['rod', 'pole', 'bar', 'ring', 'holder', 'bracket', 'metal', 'gold', 'bronze', 'object_2', 'object2'],
    curtainDetection: ['curtain', 'fabric', 'cloth', 'drapery', 'fold', 'object_3', 'object1'],
    defaultCurtainColor: "#6b7280",
    defaultRodColor: "#8b4513"
  };

  // Load textures when selectedTexture changes
  useEffect(() => {
    const loadTextures = async () => {
      setTexturesLoaded(false);
      const textureData = AVAILABLE_TEXTURES.find(t => t.id === selectedTexture);
      
      if (!textureData || textureData.type === "solid") {
        setTextures({});
        setTexturesLoaded(true);
        return;
      }

      try {
        const loadedTextures = {};
        
        if (textureData.diffuse) {
          try {
            loadedTextures.map = await loadTexture(textureData.diffuse);
          } catch (error) {
            console.error("Failed to load diffuse texture:", error);
          }
        }
        
        if (textureData.normal) {
          try {
            loadedTextures.normalMap = await loadTexture(textureData.normal);
          } catch (error) {
            console.error("Failed to load normal texture:", error);
          }
        }
        
        if (textureData.roughness) {
          try {
            loadedTextures.roughnessMap = await loadTexture(textureData.roughness);
          } catch (error) {
            console.error("Failed to load roughness texture:", error);
          }
        }

        setTextures(loadedTextures);
      } catch (error) {
        console.error("Error loading textures:", error);
        setTextures({});
      } finally {
        setTexturesLoaded(true);
      }
    };

    loadTextures();
  }, [selectedTexture]);

  // Clone the scene and set up materials
  const { clonedScene, scale, center } = useMemo(() => {
    if (!gltf.scene) return { clonedScene: null, scale: 1, center: [0, 0, 0] };
    
    const cloned = gltf.scene.clone(true);
    
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 1.0 / maxDim : 1;

    cloned.position.set(-center.x, -center.y, -center.z);
    
    return { 
      clonedScene: cloned, 
      scale, 
      center: [center.x, center.y, center.z] 
    };
  }, [gltf.scene]);

  // Apply colors, patterns, and textures to specific parts
  useEffect(() => {
    if (!clonedScene || !texturesLoaded) return;

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        if (useOriginalColors) {
          if (child.material) {
            child.material = child.material.clone();
            child.material.needsUpdate = true;
          }
        } else {
          const objectName = child.name.toLowerCase();
          const materialName = child.material?.name?.toLowerCase() || '';
          
          const isRod = modelConfig.rodDetection.some(keyword => 
            objectName.includes(keyword) || materialName.includes(keyword)
          );

          const isCurtain = modelConfig.curtainDetection.some(keyword => 
            objectName.includes(keyword) || materialName.includes(keyword)
          );

          if (isRod) {
            const finalRodColor = rodColor === "original" ? modelConfig.defaultRodColor : rodColor;
            child.material = new THREE.MeshStandardMaterial({
              color: finalRodColor,
              roughness: 0.3,
              metalness: 0.8,
            });
          } else if (isCurtain) {
            const finalCurtainColor = curtainColor === "original" ? modelConfig.defaultCurtainColor : curtainColor;
            
            if (selectedTexture !== "none" && textures.map) {
              const materialConfig = {
                map: textures.map,
                color: new THREE.Color(finalCurtainColor),
                roughness: 0.7,
                metalness: 0.1,
              };

              if (textures.normalMap) {
                materialConfig.normalMap = textures.normalMap;
                materialConfig.normalScale = new THREE.Vector2(0.5, 0.5);
              }

              if (textures.roughnessMap) {
                materialConfig.roughnessMap = textures.roughnessMap;
              }

              child.material = new THREE.MeshStandardMaterial(materialConfig);
            } else if (patternType !== "none") {
              const patternTexture = createPatternTexture(patternType, finalCurtainColor);
              patternTexture.wrapS = THREE.RepeatWrapping;
              patternTexture.wrapT = THREE.RepeatWrapping;
              patternTexture.repeat.set(2, 2);
              
              child.material = new THREE.MeshStandardMaterial({
                map: patternTexture,
                color: new THREE.Color(finalCurtainColor),
                roughness: 0.7,
                metalness: 0.1,
              });
            } else {
              child.material = new THREE.MeshStandardMaterial({
                color: finalCurtainColor,
                roughness: 0.7,
                metalness: 0.1,
              });
            }
          } else {
            const finalCurtainColor = curtainColor === "original" ? modelConfig.defaultCurtainColor : curtainColor;
            child.material = new THREE.MeshStandardMaterial({
              color: finalCurtainColor,
              roughness: 0.7,
              metalness: 0.1,
            });
          }
          
          child.material.needsUpdate = true;
        }
      }
    });
  }, [
    clonedScene, curtainColor, rodColor, useOriginalColors, patternType, 
    patternIntensity, selectedTexture, textures, texturesLoaded
  ]);

  // Set scale and position based on fold progress and direction
  useEffect(() => {
    if (groupRef.current && scale) {
      let scaleX = scale;
      let scaleY = scale;
      let scaleZ = scale;

      switch (foldDirection) {
        case "up":
          scaleY = scale * (1 - (foldProgress * 0.9));
          break;
        case "left":
          scaleX = scale * (1 - (foldProgress * 0.9));
          break;
        case "right":
          scaleX = scale * (1 - (foldProgress * 0.9));
          break;
        default:
          scaleY = scale * (1 - (foldProgress * 0.9));
      }

      groupRef.current.scale.set(scaleX, scaleY, scaleZ);
      groupRef.current.position.set(position[0], position[1], position[2]);
      
      const finalRotation = rotation[0] !== undefined ? rotation : modelConfig.defaultRotation;
      groupRef.current.rotation.set(finalRotation[0], finalRotation[1], finalRotation[2]);
    }
  }, [scale, foldProgress, foldDirection, position, rotation]);

  if (!clonedScene) return null;
  
  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} ref={meshRef} />
      <ModelDebugger model={clonedScene} />
    </group>
  );
}

// Preload curtain model
useGLTF.preload("/3d_curtain/scene.gltf");

/* ------------------- Shared Control Components ------------------- */

/* ------------------- Color Palette Component ------------------- */
function ColorPalette({ 
  selectedCurtainColor, 
  onCurtainColorChange, 
  selectedRodColor, 
  onRodColorChange,
  useOriginalColors,
  onOriginalColorsChange,
  modelType = "curtain" 
}) {
  const curtainColors = [
    { name: "Gray", value: "#6b7280", class: "bg-gray-600" },
    { name: "Red", value: "#dc2626", class: "bg-red-600" },
    { name: "Green", value: "#16a34a", class: "bg-green-600" },
    { name: "Blue", value: "#2563eb", class: "bg-blue-600" },
    { name: "Purple", value: "#9333ea", class: "bg-purple-600" },
    { name: "Pink", value: "#db2777", class: "bg-pink-600" },
    { name: "Yellow", value: "#ca8a04", class: "bg-yellow-600" },
    { name: "Teal", value: "#0d9488", class: "bg-teal-600" },
    { name: "White", value: "#f8fafc", class: "bg-white text-gray-800" },
  ];

  const rodColors = [
    { name: "Brown", value: "#8b4513", class: "bg-amber-900" },
    { name: "Gold", value: "#d4af37", class: "bg-yellow-600" },
    { name: "Silver", value: "#c0c0c0", class: "bg-gray-400" },
    { name: "Bronze", value: "#cd7f32", class: "bg-orange-700" },
    { name: "Black", value: "#1f2937", class: "bg-gray-800" },
    { name: "White", value: "#f8fafc", class: "bg-white text-gray-800" },
    { name: "Chrome", value: "#e5e7eb", class: "bg-gray-300 text-gray-800" },
    { name: "Copper", value: "#b87333", class: "bg-orange-800" },
  ];

  const fabricLabel = modelType === "blind" ? "Blind Material" : "Curtain Fabric";
  const frameLabel = modelType === "blind" ? "Blind Frame" : "Curtain Rod";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-300 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-600" />
        Colors
        <span className="text-xs bg-gray-600/30 px-2 py-1 rounded-full text-gray-700">
          {modelType === "blind" ? "Blind" : "Curtain"}
        </span>
      </h3>
      
      {/* Original Colors Toggle */}
      <div className="mb-4">
        <motion.button
          className={cn(
            "w-full p-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg flex items-center justify-center gap-2",
            useOriginalColors 
              ? "bg-gradient-to-r from-gray-700 to-black text-white ring-2 ring-gray-500" 
              : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400"
          )}
          onClick={() => onOriginalColorsChange(!useOriginalColors)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <Circle className={cn("w-4 h-4", useOriginalColors ? "fill-white" : "fill-gray-600")} />
          Use Original 3D Model Colors
        </motion.button>
        {useOriginalColors && (
          <motion.p 
            className="text-gray-600 text-xs mt-2 text-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Original model colors enabled
          </motion.p>
        )}
      </div>

      {!useOriginalColors && (
        <>
          {/* Fabric Colors */}
          <div className="mb-4">
            <h4 className="text-gray-800 font-semibold mb-2 text-sm flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              {fabricLabel}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {curtainColors.map((color) => (
                <motion.button
                  key={color.value}
                  className={cn(
                    "relative p-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-xs",
                    color.class,
                    selectedCurtainColor === color.value && "ring-2 ring-gray-700 ring-opacity-60 shadow-xl",
                    color.value === "#f8fafc" ? "text-gray-800" : "text-white"
                  )}
                  onClick={() => onCurtainColorChange(color.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {color.name}
                  {selectedCurtainColor === color.value && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Frame/Rod Colors */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-2 text-sm flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              {frameLabel}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {rodColors.map((color) => (
                <motion.button
                  key={color.value}
                  className={cn(
                    "relative p-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-xs",
                    color.class,
                    color.value === "#f8fafc" || color.value === "#e5e7eb" ? "text-gray-800" : "text-white",
                    selectedRodColor === color.value && "ring-2 ring-gray-700 ring-opacity-60 shadow-xl"
                  )}
                  onClick={() => onRodColorChange(color.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {color.name}
                  {selectedRodColor === color.value && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="mt-4 p-3 bg-gray-100 rounded-xl border border-gray-300">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-gray-400" 
                  style={{ backgroundColor: selectedCurtainColor }}
                ></div>
                <span className="text-gray-700">{fabricLabel.split(' ')[0]}: {curtainColors.find(c => c.value === selectedCurtainColor)?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-gray-400" 
                  style={{ backgroundColor: selectedRodColor }}
                ></div>
                <span className="text-gray-700">{frameLabel.split(' ')[0]}: {rodColors.find(c => c.value === selectedRodColor)?.name}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------- Texture Controls Component ------------------- */
function TextureControls({ 
  selectedTexture, 
  onTextureChange,
  modelType = "curtain" 
}) {
  const [loadingTexture, setLoadingTexture] = useState(null);

  const handleTextureClick = (textureId) => {
    setLoadingTexture(textureId);
    onTextureChange(textureId);
    
    setTimeout(() => {
      setLoadingTexture(null);
    }, 1000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-300 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Image className="w-4 h-4 text-gray-600" />
        Fabric Textures
        {loadingTexture && (
          <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin ml-2"></div>
        )}
      </h3>
      
      <div className="space-y-4">
        {/* Texture Selection */}
        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_TEXTURES.map((texture) => (
            <motion.button
              key={texture.id}
              onClick={() => handleTextureClick(texture.id)}
              disabled={loadingTexture === texture.id}
              className={cn(
                "relative p-3 rounded-xl transition-all duration-300 transform text-left min-h-[80px] flex flex-col justify-end border-2",
                selectedTexture === texture.id 
                  ? "border-gray-600 bg-gray-100 shadow-lg scale-105 text-gray-800" 
                  : "border-gray-300 bg-white hover:bg-gray-50 hover:scale-102 text-gray-700",
                loadingTexture === texture.id && "opacity-50 cursor-not-allowed"
              )}
              whileHover={{ scale: loadingTexture === texture.id ? 1 : 1.02 }}
              whileTap={{ scale: loadingTexture === texture.id ? 1 : 0.98 }}
            >
              <div className={cn("absolute inset-0 rounded-xl -z-10", texture.preview)}>
                {texture.id !== "none" && (
                  <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
                )}
              </div>
              <div className="relative z-10">
                <div className="font-semibold text-sm mb-1">{texture.name}</div>
                <div className="text-xs opacity-80">{texture.description}</div>
              </div>
              {selectedTexture === texture.id && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </motion.div>
              )}
              {loadingTexture === texture.id && (
                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Current Texture Status */}
        <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">
              Current: <strong>{AVAILABLE_TEXTURES.find(t => t.id === selectedTexture)?.name}</strong>
            </span>
            {selectedTexture !== "none" && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                <span className="text-gray-600 text-xs font-bold">
                  Texture Applied
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------- Pattern Controls Component ------------------- */
function PatternControls({ 
  patternType, 
  onPatternChange,
  patternIntensity,
  onPatternIntensityChange 
}) {
  const patterns = [
    { 
      id: "none", 
      name: "Solid Color", 
      description: "No pattern",
      preview: "bg-gradient-to-br from-gray-600 to-gray-700"
    },
    { 
      id: "floral", 
      name: "Floral", 
      description: "Elegant flower pattern",
      preview: "bg-gradient-to-br from-gray-500 to-gray-700 relative overflow-hidden"
    },
    { 
      id: "geometric", 
      name: "Geometric", 
      description: "Modern geometric shapes",
      preview: "bg-gradient-to-br from-gray-500 to-gray-700 relative overflow-hidden"
    },
    { 
      id: "stripes", 
      name: "Stripes", 
      description: "Classic striped pattern",
      preview: "bg-gradient-to-br from-gray-500 to-gray-700 relative overflow-hidden"
    },
    { 
      id: "polka", 
      name: "Polka Dots", 
      description: "Playful dot pattern",
      preview: "bg-gradient-to-br from-gray-500 to-gray-700 relative overflow-hidden"
    }
  ];

  // Pattern preview elements
  const PatternPreviews = {
    floral: () => (
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-2 right-3 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute bottom-1 right-2 w-1 h-1 bg-white rounded-full"></div>
      </div>
    ),
    geometric: () => (
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-0 left-0 w-2 h-2 bg-white rotate-45"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-white rotate-45"></div>
      </div>
    ),
    stripes: () => (
      <div className="absolute inset-0 opacity-70">
        <div className="w-full h-0.5 bg-white absolute top-1"></div>
        <div className="w-full h-0.5 bg-white absolute top-3"></div>
        <div className="w-full h-0.5 bg-white absolute bottom-1"></div>
      </div>
    ),
    polka: () => (
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute bottom-2 right-1 w-1 h-1 bg-white rounded-full"></div>
      </div>
    ),
    none: () => null
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-300 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-gray-600" />
        Pattern Design
      </h3>
      
      <div className="space-y-4">
        {/* Pattern Selection */}
        <div className="grid grid-cols-2 gap-3">
          {patterns.map((pattern) => {
            const PatternPreview = PatternPreviews[pattern.id];
            return (
              <motion.button
                key={pattern.id}
                onClick={() => onPatternChange(pattern.id)}
                className={cn(
                  "relative p-3 rounded-xl transition-all duration-300 transform text-left min-h-[80px] flex flex-col justify-end border-2",
                  patternType === pattern.id 
                    ? "border-gray-600 bg-gray-100 shadow-lg scale-105 text-gray-800" 
                    : "border-gray-300 bg-white hover:bg-gray-50 hover:scale-102 text-gray-700"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn("absolute inset-0 rounded-xl -z-10", pattern.preview)}>
                  <PatternPreview />
                </div>
                <div className="relative z-10">
                  <div className="font-semibold text-sm mb-1">{pattern.name}</div>
                  <div className="text-xs opacity-80">{pattern.description}</div>
                </div>
                {patternType === pattern.id && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Pattern Intensity Slider */}
        {patternType !== "none" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-sm font-medium">Pattern Intensity</span>
              <span className="text-gray-600 text-sm font-bold">
                {Math.round(patternIntensity * 100)}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={patternIntensity}
                onChange={(e) => onPatternIntensityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-full appearance-none cursor-pointer slider"
              />
              <div 
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full pointer-events-none"
                style={{ width: `${patternIntensity * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtle</span>
              <span>Bold</span>
            </div>
          </div>
        )}

        {/* Current Pattern Status */}
        <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">
              Current: <strong>{patterns.find(p => p.id === patternType)?.name}</strong>
            </span>
            {patternType !== "none" && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                <span className="text-gray-600 text-xs font-bold">
                  {Math.round(patternIntensity * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------- Position Controls Component ------------------- */
function PositionControls({ position, onPositionChange, onReset }) {
  const moveStep = 0.1;

  const handleMove = (axis, direction) => {
    const newPosition = [...position];
    if (axis === 'x') newPosition[0] += direction * moveStep;
    if (axis === 'y') newPosition[1] += direction * moveStep;
    onPositionChange(newPosition);
  };

  const handleReset = () => {
    onReset([0, 0, 0]);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-300 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Move className="w-4 h-4 text-gray-600" />
        Position
      </h3>
      
      <div className="space-y-3">
        {/* Position Display */}
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-600">X Pos</p>
              <p className="text-gray-800 font-bold text-sm">{position[0].toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-600">Y Pos</p>
              <p className="text-gray-800 font-bold text-sm">{position[1].toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Directional Controls */}
        <div className="space-y-2">
          {/* Up Button */}
          <motion.button
            onClick={() => handleMove('y', 1)}
            className="w-full bg-gradient-to-r from-gray-700 to-black text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowUp className="w-4 h-4" />
            Move Up
          </motion.button>

          {/* Left/Right Row */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={() => handleMove('x', -1)}
              className="bg-gradient-to-r from-gray-600 to-gray-800 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Left
            </motion.button>
            
            <motion.button
              onClick={() => handleMove('x', 1)}
              className="bg-gradient-to-r from-gray-600 to-gray-800 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowRight className="w-4 h-4" />
              Right
            </motion.button>
          </div>

          {/* Down Button */}
          <motion.button
            onClick={() => handleMove('y', -1)}
            className="w-full bg-gradient-to-r from-gray-700 to-black text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronDown className="w-4 h-4" />
            Move Down
          </motion.button>
        </div>

        {/* Reset Button */}
        <motion.button
          onClick={handleReset}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="w-3 h-3" />
          Reset Position
        </motion.button>
      </div>
    </div>
  );
}

/* ------------------- Action Buttons Component ------------------- */
function ActionButtons({ onBack, onDownload, onShare }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-300 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Actions</h3>
      <div className="space-y-2">
        <motion.button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </motion.button>
        
        <motion.button
          onClick={onDownload}
          className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-4 h-4" />
          Download Preview
        </motion.button>
        
        <motion.button
          onClick={onShare}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Share2 className="w-4 h-4" />
          Share Design
        </motion.button>
      </div>
    </div>
  );
}

/* ------------------- Controls Toggle Component ------------------- */
function ControlsToggle({ showControls, onToggle }) {
  return (
    <motion.div 
      className="flex justify-center mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 transform shadow-lg",
          showControls 
            ? "bg-gradient-to-r from-gray-700 to-black text-white" 
            : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showControls ? (
          <>
            <EyeOff className="w-4 h-4" />
            Hide Controls
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            Show Controls
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

/* ------------------- Fold Controls Component ------------------- */
function FoldControls({ 
  foldProgress, 
  foldDirection, 
  onFoldChange, 
  onFoldDirectionChange
}) {
  const handleFoldIncrease = () => {
    const newProgress = Math.min(1, foldProgress + 0.1);
    onFoldChange(newProgress);
  };

  const handleFoldDecrease = () => {
    const newProgress = Math.max(0, foldProgress - 0.1);
    onFoldChange(newProgress);
  };

  const handleResetFold = () => {
    onFoldChange(0);
  };

  const getFoldStatusText = () => {
    if (foldProgress === 0) {
      return `Fully Open`;
    } else if (foldProgress === 1) {
      return `Fully Folded ${foldDirection}`;
    } else {
      return `${Math.round(foldProgress * 100)}% Folded ${foldDirection}`;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-300 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <ChevronUp className="w-4 h-4 text-gray-600" />
        Fold Controls
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </h3>
      
      <div className="space-y-4">
        {/* Fold Direction Selection */}
        <div className="space-y-2">
          <h4 className="text-gray-800 font-semibold text-sm">Fold Direction</h4>
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              onClick={() => onFoldDirectionChange("up")}
              className={cn(
                "p-2 rounded-xl font-medium transition-all duration-300 flex flex-col items-center gap-1 text-xs",
                foldDirection === "up" 
                  ? "bg-gradient-to-r from-gray-700 to-black text-white ring-2 ring-gray-500" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronUp className="w-4 h-4" />
              Up/Down
            </motion.button>
            
            <motion.button
              onClick={() => onFoldDirectionChange("left")}
              className={cn(
                "p-2 rounded-xl font-medium transition-all duration-300 flex flex-col items-center gap-1 text-xs",
                foldDirection === "left" 
                  ? "bg-gradient-to-r from-gray-700 to-black text-white ring-2 ring-gray-500" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-4 h-4" />
              Left
            </motion.button>
            
            <motion.button
              onClick={() => onFoldDirectionChange("right")}
              className={cn(
                "p-2 rounded-xl font-medium transition-all duration-300 flex flex-col items-center gap-1 text-xs",
                foldDirection === "right" 
                  ? "bg-gradient-to-r from-gray-700 to-black text-white ring-2 ring-gray-500" 
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-4 h-4" />
              Right
            </motion.button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">0%</span>
            <span className="text-gray-800 font-semibold">{Math.round(foldProgress * 100)}%</span>
            <span className="text-gray-600">100%</span>
          </div>
          <div className="bg-gray-300 rounded-full h-3 overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-gray-600 to-gray-800"
              initial={{ width: `${foldProgress * 100}%` }}
              animate={{ width: `${foldProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        {/* Status Display */}
        <div className="text-center bg-gray-100 rounded-lg p-2">
          <span className="text-gray-800 font-bold text-sm">
            {getFoldStatusText()}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={handleFoldDecrease}
            disabled={foldProgress === 0}
            className={cn(
              "bg-gradient-to-r from-gray-600 to-gray-800 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1 text-sm",
              foldProgress === 0 ? "opacity-50 cursor-not-allowed" : "hover:shadow-gray-500/25"
            )}
            whileHover={foldProgress > 0 ? { scale: 1.02 } : {}}
            whileTap={foldProgress > 0 ? { scale: 0.98 } : {}}
          >
            <ChevronDown className="w-4 h-4" />
            Less Fold
          </motion.button>
          
          <motion.button
            onClick={handleFoldIncrease}
            disabled={foldProgress === 1}
            className={cn(
              "bg-gradient-to-r from-gray-600 to-gray-800 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1 text-sm",
              foldProgress === 1 ? "opacity-50 cursor-not-allowed" : "hover:shadow-gray-500/25"
            )}
            whileHover={foldProgress < 1 ? { scale: 1.02 } : {}}
            whileTap={foldProgress < 1 ? { scale: 0.98 } : {}}
          >
            <ChevronUp className="w-4 h-4" />
            More Fold
          </motion.button>
        </div>

        {/* Reset Button */}
        <motion.button
          onClick={handleResetFold}
          disabled={foldProgress === 0}
          className={cn(
            "w-full bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 text-sm",
            foldProgress === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"
          )}
          whileHover={foldProgress > 0 ? { scale: 1.02 } : {}}
          whileTap={foldProgress > 0 ? { scale: 0.98 } : {}}
        >
          <RotateCcw className="w-3 h-3" />
          Reset Fold
        </motion.button>
      </div>
    </div>
  );
}

/* ------------------- Mobile Controls Panel ------------------- */
function MobileControlsPanel({ 
  selectedCurtainColor, 
  onCurtainColorChange, 
  selectedRodColor, 
  onRodColorChange,
  useOriginalColors,
  onOriginalColorsChange,
  position, 
  onPositionChange, 
  onResetPosition,
  foldProgress,
  foldDirection,
  onFoldChange,
  onFoldDirectionChange,
  patternType,
  onPatternChange,
  patternIntensity,
  onPatternIntensityChange,
  selectedTexture,
  onTextureChange,
  onBack,
  onDownload,
  onShare,
  showControls,
  modelType
}) {
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'textures', label: 'Textures', icon: Image },
    { id: 'patterns', label: 'Designs', icon: Zap },
    { id: 'position', label: 'Move', icon: Move },
    { id: 'fold', label: 'Fold', icon: ChevronUp },
    { id: 'actions', label: 'More', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colors':
        return (
          <ColorPalette 
            selectedCurtainColor={selectedCurtainColor}
            onCurtainColorChange={onCurtainColorChange}
            selectedRodColor={selectedRodColor}
            onRodColorChange={onRodColorChange}
            useOriginalColors={useOriginalColors}
            onOriginalColorsChange={onOriginalColorsChange}
            modelType={modelType}
          />
        );
      case 'textures':
        return (
          <TextureControls
            selectedTexture={selectedTexture}
            onTextureChange={onTextureChange}
            modelType={modelType}
          />
        );
      case 'patterns':
        return (
          <PatternControls
            patternType={patternType}
            onPatternChange={onPatternChange}
            patternIntensity={patternIntensity}
            onPatternIntensityChange={onPatternIntensityChange}
          />
        );
      case 'position':
        return (
          <PositionControls
            position={position}
            onPositionChange={onPositionChange}
            onReset={onResetPosition}
          />
        );
      case 'fold':
        return (
          <FoldControls 
            foldProgress={foldProgress}
            foldDirection={foldDirection}
            onFoldChange={onFoldChange}
            onFoldDirectionChange={onFoldDirectionChange}
          />
        );
      case 'actions':
        return (
          <ActionButtons
            onBack={onBack}
            onDownload={onDownload}
            onShare={onShare}
          />
        );
      default:
        return null;
    }
  };

  if (!showControls) return null;

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-300 mb-3 shadow-lg">
        <div className="grid grid-cols-6 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-2 rounded-xl font-medium text-xs transition-all duration-200 flex flex-col items-center gap-1",
                  activeTab === tab.id 
                    ? "bg-gray-200 text-gray-800 shadow-lg" 
                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-h-64 overflow-y-auto">
        {renderTabContent()}
      </div>

      {/* Quick Instructions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-300 mt-3 shadow-lg">
        <p className="text-gray-700 text-xs text-center">
          Use <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">WASD</kbd> to move • 
          <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs mx-1">↑↓</kbd> to fold •
          Drag to rotate, scroll to zoom
        </p>
      </div>
    </div>
  );
}

/* ------------------- Main Curtain3D Component ------------------- */
export default function Curtain3D() {
  const location = useLocation();
  const navigate = useNavigate();
  const [windowImage, setWindowImage] = useState(null);
  const [selectedCurtainColor, setSelectedCurtainColor] = useState("#6b7280");
  const [selectedRodColor, setSelectedRodColor] = useState("#8b4513");
  const [useOriginalColors, setUseOriginalColors] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [foldProgress, setFoldProgress] = useState(0);
  const [foldDirection, setFoldDirection] = useState("up");
  const [curtainPosition, setCurtainPosition] = useState([0, -0.050, 0]);
  const [showControls, setShowControls] = useState(true);
  const [patternType, setPatternType] = useState("none");
  const [patternIntensity, setPatternIntensity] = useState(0.5);
  const [selectedTexture, setSelectedTexture] = useState("none");

  const { selectedCategory } = location.state || {
    selectedCategory: { name: "Modern Curtains" }
  };

  useEffect(() => {
    const img = localStorage.getItem("windowPhoto");
    if (img) setWindowImage(img);
    
    setTimeout(() => setIsLoading(false), 1000);

    const handleKeyPress = (event) => {
      const moveStep = 0.1;
      
      switch(event.key.toLowerCase()) {
        case 'arrowup':
          event.preventDefault();
          setFoldProgress(prev => Math.min(1, prev + 0.1));
          break;
        case 'arrowdown':
          event.preventDefault();
          setFoldProgress(prev => Math.max(0, prev - 0.1));
          break;
        case 'w':
          event.preventDefault();
          setCurtainPosition(prev => [prev[0], prev[1] + moveStep, prev[2]]);
          break;
        case 's':
          event.preventDefault();
          setCurtainPosition(prev => [prev[0], prev[1] - moveStep, prev[2]]);
          break;
        case 'a':
          event.preventDefault();
          setCurtainPosition(prev => [prev[0] - moveStep, prev[1], prev[2]]);
          break;
        case 'd':
          event.preventDefault();
          setCurtainPosition(prev => [prev[0] + moveStep, prev[1], prev[2]]);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handlePositionChange = (newPosition) => {
    setCurtainPosition(newPosition);
  };

  const handleResetPosition = () => {
    setCurtainPosition([0, 0, 0]);
  };

  const handleBackToStyles = () => {
    navigate("/category");
  };

  const handleDownload = () => {
    const event = new CustomEvent('showToast', { 
      detail: { 
        message: 'Curtain preview downloaded successfully!', 
        type: 'success' 
      } 
    });
    window.dispatchEvent(event);
  };

  const handleShare = () => {
    const event = new CustomEvent('showToast', { 
      detail: { 
        message: 'Curtain design shared successfully!', 
        type: 'success' 
      } 
    });
    window.dispatchEvent(event);
  };

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
          Customizing: <span className="bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">{selectedCategory?.name}</span>
        </motion.h1>
        <motion.p 
          className="text-gray-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          3D Curtain Customization
        </motion.p>

        <ControlsToggle 
          showControls={showControls} 
          onToggle={() => setShowControls(!showControls)} 
        />
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto flex-1 relative z-10">
        {/* Main 3D Preview Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-300 shadow-2xl p-4 flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl z-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>
                  <p className="text-gray-700 text-sm font-semibold">Loading 3D Curtain...</p>
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

            <div className="relative w-full h-[400px] md:h-[900px] rounded-xl overflow-hidden">
              {windowImage ? (
                <div className="absolute inset-0 w-full h-full">
                  <Canvas
                    style={{ width: "100%", height: "500px" }}
                    camera={{ position: [0, 0, 2.5], fov: 45 }}
                  >
                    <ambientLight intensity={1.0} />
                    <directionalLight position={[20, 5, 25]} intensity={2} />

                    <Suspense fallback={null}>
                      <CurtainModel 
                        position={curtainPosition}
                        curtainColor={selectedCurtainColor}
                        rodColor={selectedRodColor}
                        foldProgress={foldProgress}
                        foldDirection={foldDirection}
                        useOriginalColors={useOriginalColors}
                        patternType={patternType}
                        patternIntensity={patternIntensity}
                        selectedTexture={selectedTexture}
                        rotation={[0,4.8,0]} 
                      />
                      <Environment preset="city" />
                    </Suspense>

                    <OrbitControls
  enablePan={false}
   enableRotate={false}
  enableZoom={false}  // ✅ Corrected: disable zoom
  minDistance={1.2}
  maxDistance={8}
  minPolarAngle={Math.PI / 2 - 0.6}
  maxPolarAngle={Math.PI / 2 + 0.6}
/>

                  </Canvas>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-xl">
                  <div className="text-center text-gray-700">
                    <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Palette className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-sm">No window photo found</p>
                    <p className="text-gray-500 text-xs">Please capture a window image first</p>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Desktop Controls Sidebar */}
        {showControls && (
          <div className="hidden lg:flex lg:w-80 flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <ColorPalette 
                selectedCurtainColor={selectedCurtainColor}
                onCurtainColorChange={setSelectedCurtainColor}
                selectedRodColor={selectedRodColor}
                onRodColorChange={setSelectedRodColor}
                useOriginalColors={useOriginalColors}
                onOriginalColorsChange={setUseOriginalColors}
                modelType="curtain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              <TextureControls
                selectedTexture={selectedTexture}
                onTextureChange={setSelectedTexture}
                modelType="curtain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <PatternControls
                patternType={patternType}
                onPatternChange={setPatternType}
                patternIntensity={patternIntensity}
                onPatternIntensityChange={setPatternIntensity}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
            >
              <PositionControls
                position={curtainPosition}
                onPositionChange={handlePositionChange}
                onReset={handleResetPosition}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <FoldControls 
                foldProgress={foldProgress}
                foldDirection={foldDirection}
                onFoldChange={setFoldProgress}
                onFoldDirectionChange={setFoldDirection}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <ActionButtons
                onBack={handleBackToStyles}
                onDownload={handleDownload}
                onShare={handleShare}
              />
            </motion.div>

            {/* Instructions */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-300 shadow-lg"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <h3 className="text-md font-bold text-gray-800 mb-2">Instructions</h3>
              <ul className="text-gray-600 text-xs space-y-1">
                <li className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  Toggle "Original Colors" to see the default model
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                  Choose from realistic fabric textures
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  Choose from 4 different patterns
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                  Choose separate colors for fabric and rod
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                  Use position controls or WASD keys to move
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  Choose fold direction (Up/Down, Left, Right)
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  Use buttons or arrow keys to adjust fold amount
                </li>
                <li className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  Drag to rotate, scroll to zoom
                </li>
              </ul>
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile Controls Panel */}
      <MobileControlsPanel
        selectedCurtainColor={selectedCurtainColor}
        onCurtainColorChange={setSelectedCurtainColor}
        selectedRodColor={selectedRodColor}
        onRodColorChange={setSelectedRodColor}
        useOriginalColors={useOriginalColors}
        onOriginalColorsChange={setUseOriginalColors}
        position={curtainPosition}
        onPositionChange={handlePositionChange}
        onResetPosition={handleResetPosition}
        foldProgress={foldProgress}
        foldDirection={foldDirection}
        onFoldChange={setFoldProgress}
        onFoldDirectionChange={setFoldDirection}
        patternType={patternType}
        onPatternChange={setPatternType}
        patternIntensity={patternIntensity}
        onPatternIntensityChange={setPatternIntensity}
        selectedTexture={selectedTexture}
        onTextureChange={setSelectedTexture}
        onBack={handleBackToStyles}
        onDownload={handleDownload}
        onShare={handleShare}
        showControls={showControls}
        modelType="curtain"
      />

      {/* Bottom Status Bar */}
      {showControls && (
        <motion.div
          className="hidden lg:flex fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-300 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
            <span className="font-medium text-sm">
              Curtain • 
              {useOriginalColors ? " Original Colors" : 
               `${curtainColors.find(c => c.value === selectedCurtainColor)?.name} curtain, ${rodColors.find(c => c.value === selectedRodColor)?.name} rod`} • 
              {selectedTexture !== "none" ? ` ${AVAILABLE_TEXTURES.find(t => t.id === selectedTexture)?.name} texture` : 
               patternType !== "none" ? ` ${patterns.find(p => p.id === patternType)?.name} pattern` : " Solid color"} •
              {foldProgress === 0 ? " Fully Open" : 
               foldProgress === 1 ? ` Fully Folded ${foldDirection}` : 
               ` ${Math.round(foldProgress * 100)}% Folded ${foldDirection}`} •
              Position: X:{curtainPosition[0].toFixed(1)} Y:{curtainPosition[1].toFixed(1)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Helper arrays for status bar
const curtainColors = [
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#9333ea" },
  { name: "Pink", value: "#db2777" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Teal", value: "#0d9488" },
  { name: "White", value: "#f8fafc" },
];

const rodColors = [
  { name: "Brown", value: "#8b4513" },
  { name: "Gold", value: "#d4af37" },
  { name: "Silver", value: "#c0c0c0" },
  { name: "Bronze", value: "#cd7f32" },
  { name: "Black", value: "#1f2937" },
  { name: "White", value: "#f8fafc" },
  { name: "Chrome", value: "#e5e7eb" },
  { name: "Copper", value: "#b87333" },
];

const patterns = [
  { id: "none", name: "Solid Color" },
  { id: "floral", name: "Floral" },
  { id: "geometric", name: "Geometric" },
  { id: "stripes", name: "Stripes" },
  { id: "polka", name: "Polka Dots" }
];