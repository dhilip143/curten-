import React from "react";
import { motion } from "framer-motion";
import { Move, ArrowUp, ArrowRight, ArrowLeft as ArrowLeftIcon, RotateCcw, ChevronDown } from "lucide-react";

export function PositionControls({ position, onPositionChange, onReset }) {
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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <Move className="w-4 h-4 text-green-400" />
        Position
      </h3>
      
      <div className="space-y-3">
        {/* Position Display */}
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-400">X Pos</p>
              <p className="text-white font-bold text-sm">{position[0].toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-400">Y Pos</p>
              <p className="text-white font-bold text-sm">{position[1].toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Directional Controls */}
        <div className="space-y-2">
          {/* Up Button */}
          <motion.button
            onClick={() => handleMove('y', 1)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
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
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Left
            </motion.button>
            
            <motion.button
              onClick={() => handleMove('x', 1)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
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
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
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
          className="w-full bg-white/10 text-white py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
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