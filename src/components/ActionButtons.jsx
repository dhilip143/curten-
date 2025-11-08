import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2 } from "lucide-react";

export function ActionButtons({ onBack, onDownload, onShare }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-3">Actions</h3>
      <div className="space-y-2">
        <motion.button
          onClick={onBack}
          className="w-full bg-white/10 text-white py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </motion.button>
        
        <motion.button
          onClick={onDownload}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-4 h-4" />
          Download Preview
        </motion.button>
        
        <motion.button
          onClick={onShare}
          className="w-full bg-white/10 text-white py-2 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
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