import React, { Suspense, useEffect, useState, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { HexColorPicker } from "react-colorful";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Image,
  X,
  Menu
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
            context.moveTo(i * tileSize + tileSize / 2, j * tileSize);
            context.lineTo(i * tileSize + tileSize, j * tileSize + tileSize / 2);
            context.lineTo(i * tileSize + tileSize / 2, j * tileSize + tileSize);
            context.lineTo(i * tileSize, j * tileSize + tileSize / 2);
            context.closePath();
            context.fill();
          }
        }
      }
      break;

  

    case 'polka':
      context.fillStyle = primaryColor;
      const dotSize = 12;
      const dotSpacing = 32;
      for (let i = 0; i < size; i += dotSpacing) {
        for (let j = 0; j < size; j += dotSpacing) {
          context.beginPath();
          context.arc(i + dotSpacing / 2, j + dotSpacing / 2, dotSize / 2, 0, Math.PI * 2);
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
  const gltf = useGLTF("/Curtainsss.glb");
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
useGLTF.preload("/Curtainsss.glb");

/* ------------------- Mobile Control Components ------------------- */

/* ------------------- Mobile Header ------------------- */
function MobileHeader({ onBack, onMenuToggle, currentTab }) {
  const tabLabels = {
    colors: "Colors",
    textures: "Textures",
    patterns: "Designs",
    position: "Position",
    fold: "Fold",
    actions: "Actions"
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-300 p-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="flex items-center justify-between">
        <motion.button
          onClick={onBack}
          className="p-2 bg-gray-200 rounded-xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </motion.button>

        <div className="text-center flex-1 mx-4">
          <h1 className="text-lg font-bold text-gray-800">Curtain Designer</h1>
          <p className="text-xs text-gray-600">{tabLabels[currentTab]}</p>
        </div>

        <motion.button
          onClick={onMenuToggle}
          className="p-2 bg-gray-200 rounded-xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ------------------- Mobile Tab Navigation ------------------- */
function MobileTabNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'textures', label: 'Textures', icon: Image },
    { id: 'patterns', label: 'Designs', icon: Zap },
    { id: 'position', label: 'Move', icon: Move },
    { id: 'fold', label: 'Fold', icon: ChevronUp },
    { id: 'actions', label: 'More', icon: Settings },
  ];

  return (
    <motion.div
      className="fixed top-18 left-0 right-0 z-50  backdrop-blur-lg border-t border-gray-300 p-3"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, delay: 0.1 }}
    >
      <div className="grid grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "py-2 rounded-xl font-medium text-xs transition-all duration-200 flex flex-col items-center gap-1",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-gray-700 to-black text-white shadow-lg"
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
    </motion.div>
  );
}

/* ------------------- Mobile Control Panels ------------------- */

/* ------------------- Color Palette Component ------------------- */
function MobileColorPalette({
  selectedCurtainColor,
  onCurtainColorChange,
  selectedRodColor,
  onRodColorChange,
  useOriginalColors
}) {
  const [showCurtainPicker, setShowCurtainPicker] = useState(false);
  const [showRodPicker, setShowRodPicker] = useState(false);

  const curtainColors = [
    { name: "Gray", value: "#6b7280", class: "bg-gray-600" },
    { name: "Red", value: "#dc2626", class: "bg-red-600" },
    { name: "Green", value: "#16a34a", class: "bg-green-600" },
    { name: "Blue", value: "#2563eb", class: "bg-blue-600" },
    { name: "Purple", value: "#9333ea", class: "bg-purple-600" },
    { name: "Pink", value: "#db2777", class: "bg-pink-600" },
    { name: "Yellow", value: "#ca8a04", class: "bg-yellow-600" },
    { name: "Custom", value: "custom", class: "bg-white border border-gray-400" }
  ];

  const rodColors = [
    { name: "Brown", value: "#8b4513", class: "bg-amber-900" },
    { name: "Gold", value: "#d4af37", class: "bg-yellow-600" },
    { name: "Silver", value: "#c0c0c0", class: "bg-gray-400" },
    { name: "Bronze", value: "#cd7f32", class: "bg-orange-700" },
    { name: "Black", value: "#1f2937", class: "bg-gray-800" },
    { name: "Chrome", value: "#e5e7eb", class: "bg-gray-300" },
    { name: "Copper", value: "#b87333", class: "bg-orange-800" },
    { name: "Custom", value: "custom", class: "bg-white border border-gray-400" }
  ];

  // Circular Color Wheel Picker Component
  const ColorWheelPicker = ({ color, onChange, onClose }) => {
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [lightness, setLightness] = useState(50);
    const wheelRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Convert hex to HSL
    const hexToHsl = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    };

    // Convert HSL to Hex
    const hslToHex = (h, s, l) => {
      h /= 360;
      s /= 100;
      l /= 100;
      
      let r, g, b;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // Initialize from current color
    useEffect(() => {
      if (color && color !== '#ffffff') {
        const hsl = hexToHsl(color);
        setHue(hsl.h);
        setSaturation(hsl.s);
        setLightness(hsl.l);
      }
    }, [color]);

    const handleWheelClick = (e) => {
      if (!wheelRef.current) return;
      
      const rect = wheelRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = e.clientX - rect.left - centerX;
      const y = e.clientY - rect.top - centerY;
      
      // Calculate angle (0° at top, increasing clockwise)
      let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      
      // Calculate distance from center (for saturation)
      const distance = Math.min(Math.sqrt(x*x + y*y), centerX - 10);
      const sat = Math.min(100, Math.round((distance / (centerX - 10)) * 100));
      
      const newHue = Math.round(angle);
      const newSaturation = sat;
      
      setHue(newHue);
      setSaturation(newSaturation);
      const newColor = hslToHex(newHue, newSaturation, lightness);
      onChange(newColor);
    };

    const handleLightnessChange = (e) => {
      const newLightness = parseInt(e.target.value);
      setLightness(newLightness);
      const newColor = hslToHex(hue, saturation, newLightness);
      onChange(newColor);
    };

    const handleMouseDown = (e) => {
      setIsDragging(true);
      handleWheelClick(e);
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        handleWheelClick(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Add event listeners for dragging
    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging]);

    // Create color wheel gradient
    const wheelStyle = {
      background: `conic-gradient(
        from 0deg,
        #ff0000 0deg,
        #ffff00 60deg,
        #00ff00 120deg,
        #00ffff 180deg,
        #0000ff 240deg,
        #ff00ff 300deg,
        #ff0000 360deg
      )`,
    };

    const currentColor = hslToHex(hue, saturation, lightness);

    return (
      <div className="w-full max-w-xs mx-auto p-4">
        <div className="relative mb-6">
          {/* Color Wheel */}
          <div 
            ref={wheelRef}
            className="relative w-64 h-64 rounded-full mx-auto cursor-pointer overflow-hidden border-4 border-white shadow-lg"
            style={wheelStyle}
            onMouseDown={handleMouseDown}
          >
            {/* White center for saturation control */}
            <div className="absolute inset-8 rounded-full bg-white"></div>
            
            {/* Selection indicator */}
            <div 
              className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${
                  Math.cos((hue - 90) * (Math.PI / 180)) * (saturation / 100) * 112
                }px, ${
                  Math.sin((hue - 90) * (Math.PI / 180)) * (saturation / 100) * 112
                }px)`,
                backgroundColor: currentColor
              }}
            />
            
            {/* Degree markers */}
          
        
          </div>
        </div>

       

        {/* Selected Color Preview */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex flex-col items-center">
           
          
          </div>
          <div className="flex flex-col items-center">
           
            
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="space-y-4 p-2 bg-white rounded-2xl shadow-lg mx-5 mt-2 mb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!useOriginalColors && (
        <>
          {/* Curtain Colors */}
          <div className="mb-4 mt-2">
            <h4 className="text-gray-800 font-semibold mb-3 text-sm flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
              Curtain Fabric
            </h4>

            <div className="grid grid-cols-8 gap-2">
              {curtainColors.map((color) => (
                <motion.button
                  key={color.name}
                  className={cn(
                    "relative w-10 h-10 rounded-full transition-all duration-300 shadow-md",
                    color.class,
                    selectedCurtainColor === color.value &&
                      "ring-2 ring-gray-700 shadow-lg"
                  )}
                  onClick={() =>
                    color.value === "custom"
                      ? setShowCurtainPicker(true)
                      : onCurtainColorChange(color.value)
                  }
                />
              ))}
            </div>
          </div>

          {/* Rod Colors */}
          <div>
            <h4 className="text-gray-800 font-semibold mb-3 text-sm flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              Curtain Rod
            </h4>

            <div className="grid grid-cols-8 gap-2">
              {rodColors.map((color) => (
                <motion.button
                  key={color.name}
                  className={cn(
                    "relative w-10 h-10 rounded-full transition-all duration-300 shadow-md",
                    color.class,
                    selectedRodColor === color.value &&
                      "ring-2 ring-gray-700 shadow-lg"
                  )}
                  onClick={() =>
                    color.value === "custom"
                      ? setShowRodPicker(true)
                      : onRodColorChange(color.value)
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* CURTAIN COLOR POPUP */}
      {showCurtainPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm mx-4 flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-lg">Pick Curtain Color</h3>
            
            <ColorWheelPicker
              color={selectedCurtainColor}
              onChange={onCurtainColorChange}
              onClose={() => setShowCurtainPicker(false)}
            />

            <button
              onClick={() => setShowCurtainPicker(false)}
              className="mt-4 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ROD COLOR POPUP */}
      {showRodPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm mx-4 flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-lg">Pick Rod Color</h3>
            
            <ColorWheelPicker
              color={selectedRodColor}
              onChange={onRodColorChange}
              onClose={() => setShowRodPicker(false)}
            />

            <button
              onClick={() => setShowRodPicker(false)}
              className="mt-4 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
/* ------------------- Texture Controls Component ------------------- */
function MobileTextureControls({
  selectedTexture,
  onTextureChange
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
    <motion.div
      className="space-y-4 p-3 bg-white  rounded-2xl shadow-lg mx-4 mt-2 mb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Image className="w-5 h-5 text-gray-600" />
    Fabric Textures
  </div>

  {/* Reset Button */}
  <button
    onClick={() => onTextureChange("none")}
    className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
  >
    Reset
  </button>
</h3>


      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_TEXTURES.map((texture) => (
            <motion.button
              key={texture.id}
              onClick={() => handleTextureClick(texture.id)}
              disabled={loadingTexture === texture.id}
              className={cn(
                "relative p-2 rounded-xl transition-all duration-300 transform text-left min-h-[10px] flex flex-col justify-end border-2",
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
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------- Pattern Controls Component ------------------- */
function MobilePatternControls({
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
      id: "polka",
      name: "Polka Dots",
      description: "Playful dot pattern",
      preview: "bg-gradient-to-br from-gray-500 to-gray-700 relative overflow-hidden"
    }
  ];

  const PatternPreviews = {
    floral: () => (
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-2 left-3 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-3 right-4 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute bottom-2 right-3 w-2 h-2 bg-white rounded-full"></div>
      </div>
    ),
    geometric: () => (
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-0 left-0 w-3 h-3 bg-white rotate-45"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-white rotate-45"></div>
      </div>
    ),
    stripes: () => (
      <div className="absolute inset-0 opacity-70">
        <div className="w-full h-1 bg-white absolute top-2"></div>
        <div className="w-full h-1 bg-white absolute top-4"></div>
        <div className="w-full h-1 bg-white absolute bottom-2"></div>
      </div>
    ),
    polka: () => (
      <div className="absolute inset-0 opacity-70">
        <div className="absolute top-2 left-3 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute bottom-3 right-2 w-2 h-2 bg-white rounded-full"></div>
      </div>
    ),
    none: () => null
  };

  return (
    <motion.div
      className="space-y-4 p-4 bg-white rounded-2xl shadow-lg mx-4 mt-2 mb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Zap className="w-5 h-5 text-gray-600" />
    Pattern Design
  </div>

  {/* Reset Button */}
  <button
    onClick={() => onPatternChange("none")}
    className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
  >
    Reset
  </button>
</h3>


      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {patterns.map((pattern) => {
            const PatternPreview = PatternPreviews[pattern.id];
            return (
              <motion.button
                key={pattern.id}
                onClick={() => onPatternChange(pattern.id)}
                className={cn(
                  "relative p-2 rounded-xl transition-all duration-300 transform text-left min-h-[14px] flex flex-col justify-end border-2",
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
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        
      </div>
    </motion.div>
  );
}

/* ------------------- Position Controls Component ------------------- */
function MobilePositionControls({ position, onPositionChange, onReset }) {
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
  <motion.div
  className="space-y-4 p-4 bg-white rounded-2xl shadow-lg mx-4 mt-2 mb-24"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-lg font-bold text-gray-800">
      Position
    </h3>
    <motion.button
      onClick={handleReset}
      className="bg-gray-200 text-gray-800 py-1 px-2 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2 text-xs "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Reset 
    </motion.button>
  </div>

  <div className="space-y-4">
    {/* Directional Controls Layout */}
    <div className="flex flex-col items-center ">
      {/* Up Button - Centered */}
      <motion.button
  onClick={() => handleMove('y', 1)}
  className="w-16 h-16 bg-gradient-to-r from-gray-700 to-black text-white rounded-full font-semibold shadow-lg flex items-center justify-center text-base"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <ArrowUp className="w-6 h-6" />
</motion.button>

      {/* Left/Middle/Right Row */}
      <div className="flex justify-center items-center gap-3 w-full">
        {/* Left Button */}
         <motion.button
    onClick={() => handleMove('x', -1)}
    className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full font-semibold shadow-lg flex items-center justify-center text-base"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <ArrowLeftIcon className="w-6 h-6" />
  </motion.button>

        {/* Middle Position Display (Static Box) */}
        <div className="w-18 h-16 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs text-gray-500 font-medium"></div>
            <div className="text-lg font-bold text-gray-800"></div>
          </div>
        </div>

        {/* Right Button */}
          <motion.button
    onClick={() => handleMove('x', 1)}
    className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full font-semibold shadow-lg flex items-center justify-center text-base"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <ArrowRight className="w-6 h-6" />
  </motion.button>
      </div>

      {/* Down Button - Centered */}
    <motion.button
  onClick={() => handleMove('y', -1)}
  className="w-16 h-16 bg-gradient-to-r from-gray-700 to-black text-white rounded-full font-semibold shadow-lg flex items-center justify-center text-base"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <ChevronDown className="w-6 h-6" />
</motion.button>
    </div>
  </div>
</motion.div>

);
}

/* ------------------- Fold Controls Component ------------------- */
function MobileFoldControls({
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
    <motion.div
      className="space-y-2 p-4 bg-white rounded-3xl shadow-lg mx-4 mt-2 mb-2 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header + Reset */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Fold Control</h3>

        <button
          onClick={handleResetFold}
          className={cn(
            "px-2 bg-gray-200 rounded-xl border border-gray-400 text-gray-800 text-sm font-semibold transition-all",
            foldProgress === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
          )}
        >
          Reset
        </button>
      </div>

      {/* Section Title */}
      <h4 className="text-gray-900 font-semibold text-base">Fold Direction</h4>

      {/* 4-Card Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2">

        {/* DOWN */}
        <motion.button
          onClick={() => onFoldDirectionChange("down")}
          className={cn(
            " rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 shadow-md text-base",
            foldDirection === "down"
              ? "bg-gray-900 text-white ring-2 ring-gray-500 shadow-lg"
              : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
          )}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronDown className="w-6 h-6" />
          Down
        </motion.button>

        {/* UP */}
        <motion.button
          onClick={() => onFoldDirectionChange("up")}
          className={cn(
            " rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 shadow-md text-base",
            foldDirection === "up"
              ? "bg-gray-900 text-white ring-2 ring-gray-500 shadow-lg"
              : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
          )}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUp className="w-6 h-6" />
          Up
        </motion.button>

        {/* LEFT */}
        <motion.button
          onClick={() => onFoldDirectionChange("left")}
          className={cn(
            " rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 shadow-md text-base",
            foldDirection === "left"
              ? "bg-gray-900 text-white ring-2 ring-gray-500 shadow-lg"
              : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
          )}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-6 h-6" />
          Left
        </motion.button>

        {/* RIGHT */}
        <motion.button
          onClick={() => onFoldDirectionChange("right")}
          className={cn(
            " rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 shadow-md text-base",
            foldDirection === "right"
              ? "bg-gray-900 text-white ring-2 ring-gray-500 shadow-lg"
              : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100"
          )}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-6 h-6" />
          Right
        </motion.button>

      </div>
    </motion.div>
  );
}

/* ------------------- Action Buttons Component ------------------- */
function MobileActionButtons({ onBack, onDownload, onShare }) {
  return (
    <motion.div
      className="space-y-4 p-4 bg-white rounded-2xl shadow-lg mx-4 mt-2 mb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-3">Actions</h3>
      <div className="space-y-3">
        <motion.button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2 text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Categories
        </motion.button>

        <motion.button
          onClick={onDownload}
          className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300 flex items-center justify-center gap-2 text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-5 h-5" />
          Download Preview
        </motion.button>

        <motion.button
          onClick={onShare}
          className="w-full bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2 text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Share2 className="w-5 h-5" />
          Share Design
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ------------------- Mobile Instructions Panel ------------------- */
function MobileInstructionsPanel({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">How to Use</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 bg-gray-200 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Basic Controls</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Swipe to rotate the curtain view</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Pinch to zoom in/out</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Use position controls to move curtain</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-100 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Design Features</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Choose from 9 curtain colors</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Select from 8 rod colors</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Apply realistic fabric textures</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Add pattern designs with adjustable intensity</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-100 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Fold Controls</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Choose fold direction: Up/Down, Left, or Right</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Adjust fold amount from 0% to 100%</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span>Reset to fully open position anytime</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Pro Tip</h3>
                  <p className="text-blue-700 text-sm">
                    Use the "Original Colors" toggle to see the curtain in its default
                    appearance before applying your custom designs.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------- Main Mobile Curtain3D Component ------------------- */
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
  const [patternType, setPatternType] = useState("none");
  const [patternIntensity, setPatternIntensity] = useState(0.5);
  const [selectedTexture, setSelectedTexture] = useState("none");

  // Mobile-specific states
  const [activeTab, setActiveTab] = useState('colors');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const img = localStorage.getItem("windowPhoto");
    if (img) setWindowImage(img);

    setTimeout(() => setIsLoading(false), 1000);

    const handleKeyPress = (event) => {
      const moveStep = 0.1;

      switch (event.key.toLowerCase()) {
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'colors':
        return (
          <MobileColorPalette
            selectedCurtainColor={selectedCurtainColor}
            onCurtainColorChange={setSelectedCurtainColor}
            selectedRodColor={selectedRodColor}
            onRodColorChange={setSelectedRodColor}
            useOriginalColors={useOriginalColors}
            onOriginalColorsChange={setUseOriginalColors}
          />
        );
      case 'textures':
        return (
          <MobileTextureControls
            selectedTexture={selectedTexture}
            onTextureChange={setSelectedTexture}
          />
        );
      case 'patterns':
        return (
          <MobilePatternControls
            patternType={patternType}
            onPatternChange={setPatternType}
            patternIntensity={patternIntensity}
            onPatternIntensityChange={setPatternIntensity}
          />
        );
      case 'position':
        return (
          <MobilePositionControls
            position={curtainPosition}
            onPositionChange={handlePositionChange}
            onReset={handleResetPosition}
          />
        );
      case 'fold':
        return (
          <MobileFoldControls
            foldProgress={foldProgress}
            foldDirection={foldDirection}
            onFoldChange={setFoldProgress}
            onFoldDirectionChange={setFoldDirection}
          />
        );
      case 'actions':
        return (
          <MobileActionButtons
            onBack={handleBackToStyles}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Mobile Header */}
      <MobileHeader
        onBack={handleBackToStyles}
        onMenuToggle={() => setShowInstructions(true)}
        currentTab={activeTab}
      />

      {/* Main 3D Preview Area */}
      <div className="pt-40 pb-3 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-300 shadow-2xl p-4 relative">
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
              className="absolute     inset-0 w-full h-110 object-cover z-0 rounded-xl opacity-80"
            />
          )}

          <div className="relative w-full h-[47vh] rounded-xl overflow-hidden">
            {windowImage ? (
              <div className="absolute inset-0 w-full h-full">
                <Canvas
                  style={{ width: "100%", height: "100%" }}
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
                      rotation={[0, 4.8, 0]}
                    />
                    <Environment preset="city" />
                  </Suspense>

                  <OrbitControls
                    enablePan={false}
                    enableRotate={true}
                    enableZoom={true}
                    minDistance={1.2}
                    maxDistance={8}
                    minPolarAngle={Math.PI / 2 - 0.6}
                    maxPolarAngle={Math.PI / 2 + 0.6}
                  />
                </Canvas>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-xl">
                <div className="text-center text-gray-700 p-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-base font-semibold mb-1">No window photo found</p>
                  <p className="text-gray-500 text-sm">Please capture a window image first</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Tab Content */}
      {renderActiveTab()}

      {/* Mobile Tab Navigation */}
      <MobileTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Instructions Panel */}
      <MobileInstructionsPanel
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Quick Status Bar */}
      <motion.div
        className="fixed top-16 left-4 right-4 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >


      </motion.div>
    </div>
  );
}