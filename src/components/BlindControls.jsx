import React from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, Minus, Plus } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function BlindControls({ 
  blindOpenAmount, 
  onBlindOpenChange 
}) {
  const handleOpenIncrease = () => {
    const newAmount = Math.min(1, blindOpenAmount + 0.1);
    onBlindOpenChange(newAmount);
  };

  const handleOpenDecrease = () => {
    const newAmount = Math.max(0, blindOpenAmount - 0.1);
    onBlindOpenChange(newAmount);
  };

  const handleFullOpen = () => {
    onBlindOpenChange(1);
  };

  const handleFullClose = () => {
    onBlindOpenChange(0);
  };

  const getBlindStatusText = () => {
    if (blindOpenAmount === 0) {
      return "Fully Closed";
    } else if (blindOpenAmount === 1) {
      return "Fully Open";
    } else {
      return `${Math.round(blindOpenAmount * 100)}% Open`;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <ChevronUp className="w-4 h-4 text-green-400" />
        Blind Controls
        <ChevronDown className="w-4 h-4 text-green-400" />
      </h3>
      
      <div className="space-y-4">
        {/* Status Display */}
        <div className="text-center bg-black/20 rounded-lg p-3 border border-green-500/30">
          <span className="text-white font-bold text-sm">
            {getBlindStatusText()}
          </span>
          <div className="mt-1 text-xs text-green-300">
            {blindOpenAmount === 0 ? "Pull rope down to open" : 
             blindOpenAmount === 1 ? "Pull rope up to close" : 
             "Adjust rope to desired position"}
          </div>
        </div>

        {/* Visual Representation */}
        <div className="relative bg-black/30 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-center mb-2">
            <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                initial={{ width: `${blindOpenAmount * 100}%` }}
                animate={{ width: `${blindOpenAmount * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          {/* Blind Visualization */}
          <div className="relative h-16 bg-gray-800/50 rounded-lg border border-gray-600 overflow-hidden">
            {/* Blind slats */}
            <div className="absolute inset-0 flex flex-col justify-start">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 border-b border-gray-700"
                  style={{
                    height: `${8 - (blindOpenAmount * 7)}%`,
                    marginTop: `${blindOpenAmount * 0.5}%`
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
            
            {/* Rope */}
            <div className="absolute right-2 top-0 bottom-0 w-1 bg-yellow-600/80 rounded-full">
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Closed</span>
            <span className="text-white font-semibold">{Math.round(blindOpenAmount * 100)}%</span>
            <span className="text-gray-300">Open</span>
          </div>
          <div className="bg-black/30 rounded-full h-3 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              initial={{ width: `${blindOpenAmount * 100}%` }}
              animate={{ width: `${blindOpenAmount * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={handleOpenDecrease}
            disabled={blindOpenAmount === 0}
            className={cn(
              "bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1 text-sm",
              blindOpenAmount === 0 ? "opacity-50 cursor-not-allowed" : "hover:shadow-red-500/25"
            )}
            whileHover={blindOpenAmount > 0 ? { scale: 1.02 } : {}}
            whileTap={blindOpenAmount > 0 ? { scale: 0.98 } : {}}
          >
            <ChevronDown className="w-4 h-4" />
            Close More
          </motion.button>
          
          <motion.button
            onClick={handleOpenIncrease}
            disabled={blindOpenAmount === 1}
            className={cn(
              "bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1 text-sm",
              blindOpenAmount === 1 ? "opacity-50 cursor-not-allowed" : "hover:shadow-green-500/25"
            )}
            whileHover={blindOpenAmount < 1 ? { scale: 1.02 } : {}}
            whileTap={blindOpenAmount < 1 ? { scale: 0.98 } : {}}
          >
            <ChevronUp className="w-4 h-4" />
            Open More
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={handleFullClose}
            disabled={blindOpenAmount === 0}
            className={cn(
              "bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1 text-sm",
              blindOpenAmount === 0 ? "opacity-50 cursor-not-allowed" : "hover:shadow-gray-500/25"
            )}
            whileHover={blindOpenAmount > 0 ? { scale: 1.02 } : {}}
            whileTap={blindOpenAmount > 0 ? { scale: 0.98 } : {}}
          >
            <Minus className="w-4 h-4" />
            Fully Close
          </motion.button>
          
          <motion.button
            onClick={handleFullOpen}
            disabled={blindOpenAmount === 1}
            className={cn(
              "bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-1 text-sm",
              blindOpenAmount === 1 ? "opacity-50 cursor-not-allowed" : "hover:shadow-blue-500/25"
            )}
            whileHover={blindOpenAmount < 1 ? { scale: 1.02 } : {}}
            whileTap={blindOpenAmount < 1 ? { scale: 0.98 } : {}}
          >
            <Plus className="w-4 h-4" />
            Fully Open
          </motion.button>
        </div>

        {/* Instructions */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-green-300 text-xs text-center">
            💡 <strong>Real Blind Simulation:</strong> Controls mimic real blind rope operation
          </p>
        </div>
      </div>
    </div>
  );
}