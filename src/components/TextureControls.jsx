import React, { useState } from "react";
import { motion } from "framer-motion";
import { Image } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

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
    preview: "bg-gradient-to-br from-blue-400 to-blue-600",
    type: "fabric"
  },
  {
    id: "cotton",
    name: "Cotton",
    description: "Natural cotton fabric",
    diffuse: "/textures/hessian_230_diff_4k.jpg",
    normal: "/textures/hessian_230_diff_4k.jpg",
    roughness: "/textures/hessian_230_diff_4k.jpg",
    preview: "bg-gradient-to-br from-white to-gray-200 text-gray-800",
    type: "fabric"
  },
  {
    id: "silk",
    name: "Silk",
    description: "Luxurious silk material",
    diffuse: "/textures/polar_fleece_anisotropy_strength_4k.png",
    preview: "bg-gradient-to-br from-purple-400 to-pink-400",
    type: "fabric"
  },
  {
    id: "linen",
    name: "Linen",
    description: "Natural linen texture",
    diffuse: "/textures/polar_fleece_anisotropy_strength_4k.png",
    preview: "bg-gradient-to-br from-amber-200 to-amber-400 text-gray-800",
    type: "fabric"
  }
];

export function TextureControls({ 
  selectedTexture, 
  onTextureChange,
  modelType = "blind" 
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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <Image className="w-4 h-4 text-orange-400" />
        Fabric Textures
        {loadingTexture && (
          <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin ml-2"></div>
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
                "relative p-3 rounded-xl text-white transition-all duration-300 transform text-left min-h-[80px] flex flex-col justify-end border-2",
                selectedTexture === texture.id 
                  ? "border-orange-400 bg-black/30 shadow-lg scale-105" 
                  : "border-white/20 bg-black/20 hover:bg-black/30 hover:scale-102",
                loadingTexture === texture.id && "opacity-50 cursor-not-allowed"
              )}
              whileHover={{ scale: loadingTexture === texture.id ? 1 : 1.02 }}
              whileTap={{ scale: loadingTexture === texture.id ? 1 : 0.98 }}
            >
              <div className={cn("absolute inset-0 rounded-xl -z-10", texture.preview)}>
                {texture.id !== "none" && (
                  <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
                )}
              </div>
              <div className="relative z-10">
                <div className="font-semibold text-sm mb-1">{texture.name}</div>
                <div className="text-xs opacity-80">{texture.description}</div>
              </div>
              {selectedTexture === texture.id && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </motion.div>
              )}
              {loadingTexture === texture.id && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Current Texture Status */}
        <div className="bg-black/20 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">
              Current: <strong>{AVAILABLE_TEXTURES.find(t => t.id === selectedTexture)?.name}</strong>
            </span>
            {selectedTexture !== "none" && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-orange-300 text-xs font-bold">
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