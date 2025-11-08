import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function PatternControls({ 
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
      preview: "bg-gradient-to-br from-pink-500 to-purple-600 relative overflow-hidden"
    },
    { 
      id: "geometric", 
      name: "Geometric", 
      description: "Modern geometric shapes",
      preview: "bg-gradient-to-br from-blue-500 to-teal-600 relative overflow-hidden"
    },
    { 
      id: "stripes", 
      name: "Stripes", 
      description: "Classic striped pattern",
      preview: "bg-gradient-to-br from-green-500 to-emerald-600 relative overflow-hidden"
    },
    { 
      id: "polka", 
      name: "Polka Dots", 
      description: "Playful dot pattern",
      preview: "bg-gradient-to-br from-yellow-500 to-orange-600 relative overflow-hidden"
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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" />
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
                  "relative p-3 rounded-xl text-white transition-all duration-300 transform text-left min-h-[80px] flex flex-col justify-end border-2",
                  patternType === pattern.id 
                    ? "border-yellow-400 bg-black/30 shadow-lg scale-105" 
                    : "border-white/20 bg-black/20 hover:bg-black/30 hover:scale-102"
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
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"
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
              <span className="text-white text-sm font-medium">Pattern Intensity</span>
              <span className="text-yellow-300 text-sm font-bold">
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
                className="w-full h-2 bg-black/30 rounded-full appearance-none cursor-pointer slider"
              />
              <div 
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full pointer-events-none"
                style={{ width: `${patternIntensity * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>Subtle</span>
              <span>Bold</span>
            </div>
          </div>
        )}

        {/* Current Pattern Status */}
        <div className="bg-black/20 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">
              Current: <strong>{patterns.find(p => p.id === patternType)?.name}</strong>
            </span>
            {patternType !== "none" && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-300 text-xs font-bold">
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