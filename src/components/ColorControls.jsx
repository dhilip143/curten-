import React from "react";
import { motion } from "framer-motion";
import { Palette, Circle } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function ColorControls({ 
  selectedCurtainColor, 
  onCurtainColorChange, 
  selectedRodColor, 
  onRodColorChange,
  useOriginalColors,
  onOriginalColorsChange,
  modelType = "blind" 
}) {
  const blindColors = [
    { name: "Slate Gray", value: "#4b5563", class: "bg-gray-600" },
    { name: "Charcoal", value: "#374151", class: "bg-gray-700" },
    { name: "Beige", value: "#d6d3d1", class: "bg-stone-300 text-gray-800" },
    { name: "White", value: "#f8fafc", class: "bg-white text-gray-800" },
    { name: "Black", value: "#1f2937", class: "bg-gray-900" },
    { name: "Navy", value: "#1e3a8a", class: "bg-blue-900" },
    { name: "Forest", value: "#166534", class: "bg-green-800" },
    { name: "Cream", value: "#fef3c7", class: "bg-yellow-100 text-gray-800" },
  ];

  const blindFrameColors = [
    { name: "White", value: "#f8fafc", class: "bg-white text-gray-800" },
    { name: "Black", value: "#1f2937", class: "bg-gray-900" },
    { name: "Silver", value: "#c0c0c0", class: "bg-gray-400 text-gray-800" },
    { name: "Bronze", value: "#cd7f32", class: "bg-orange-700" },
    { name: "Walnut", value: "#78350f", class: "bg-amber-900" },
    { name: "Stainless", value: "#6b7280", class: "bg-gray-500" },
  ];

  const fabricLabel = "Blind Material";
  const frameLabel = "Blind Frame";

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <Palette className="w-4 h-4 text-purple-400" />
        Colors
        <span className="text-xs bg-green-500/30 px-2 py-1 rounded-full">
          Blind
        </span>
      </h3>
      
      {/* Original Colors Toggle */}
      <div className="mb-4">
        <motion.button
          className={cn(
            "w-full p-3 rounded-xl font-semibold text-white transition-all duration-300 transform shadow-lg flex items-center justify-center gap-2",
            useOriginalColors 
              ? "bg-gradient-to-r from-green-600 to-green-700 ring-2 ring-green-400" 
              : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
          )}
          onClick={() => onOriginalColorsChange(!useOriginalColors)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <Circle className={cn("w-4 h-4", useOriginalColors ? "fill-white" : "")} />
          Use Original 3D Model Colors
        </motion.button>
        {useOriginalColors && (
          <motion.p 
            className="text-green-300 text-xs mt-2 text-center"
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
            <h4 className="text-white font-semibold mb-2 text-sm flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              {fabricLabel}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {blindColors.map((color) => (
                <motion.button
                  key={color.value}
                  className={cn(
                    "relative p-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-xs",
                    color.class,
                    color.value === "#f8fafc" || color.value === "#d6d3d1" || color.value === "#fef3c7" ? "text-gray-800" : "text-white",
                    selectedCurtainColor === color.value && "ring-2 ring-white ring-opacity-60 shadow-xl"
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
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Frame/Rod Colors */}
          <div>
            <h4 className="text-white font-semibold mb-2 text-sm flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              {frameLabel}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {blindFrameColors.map((color) => (
                <motion.button
                  key={color.value}
                  className={cn(
                    "relative p-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg text-xs",
                    color.class,
                    color.value === "#f8fafc" || color.value === "#c0c0c0" ? "text-gray-800" : "text-white",
                    selectedRodColor === color.value && "ring-2 ring-white ring-opacity-60 shadow-xl"
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
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="mt-4 p-3 bg-black/20 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-white/30" 
                  style={{ backgroundColor: selectedCurtainColor }}
                ></div>
                <span className="text-white">{fabricLabel.split(' ')[0]}: {blindColors.find(c => c.value === selectedCurtainColor)?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-white/30" 
                  style={{ backgroundColor: selectedRodColor }}
                ></div>
                <span className="text-white">{frameLabel.split(' ')[0]}: {blindFrameColors.find(c => c.value === selectedRodColor)?.name}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}