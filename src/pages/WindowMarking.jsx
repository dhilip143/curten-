import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  RotateCcw, 
  CheckCircle, 
  Ruler,
  Menu,
  X,
  Square
} from "lucide-react";

/* -------- Utility: Class Name Join -------- */
const cn = (...classes) => classes.filter(Boolean).join(" ");

/* -------- PREMIUM BUTTON COMPONENT -------- */
const Button = React.forwardRef(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 active:scale-95 shadow-lg md:px-8 md:text-lg",
      variant === "primary" 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500/50 shadow-blue-500/25" 
        : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 focus:ring-gray-500/50 shadow-gray-500/25 border border-gray-700",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";

/* -------- PREMIUM CARD COMPONENT -------- */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl p-4 md:p-6",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/* -------- SIMPLE WINDOW MARKING COMPONENT -------- */
const WindowMarker = ({ 
  imageSrc, 
  onWindowChange
}) => {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(null);
  const [windowPoints, setWindowPoints] = useState({
    topLeft: { x: 0.2, y: 0.2 },
    topRight: { x: 0.8, y: 0.2 },
    bottomRight: { x: 0.8, y: 0.7 },
    bottomLeft: { x: 0.2, y: 0.7 }
  });

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Calculate window dimensions and notify parent
  useEffect(() => {
    const width = Math.abs(windowPoints.topRight.x - windowPoints.topLeft.x);
    const height = Math.abs(windowPoints.bottomLeft.y - windowPoints.topLeft.y);
    
    const windowData = {
      points: windowPoints,
      width,
      height,
      area: width * height
    };
    
    onWindowChange(windowData);
  }, [windowPoints, onWindowChange]);

  const handlePointDrag = useCallback((pointName, clientX, clientY) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    setWindowPoints(prev => {
      const newPoints = { ...prev };
      newPoints[pointName] = { x, y };
      
      // Maintain rectangular shape by adjusting adjacent points
      switch (pointName) {
        case 'topLeft':
          newPoints.topRight.y = y;
          newPoints.bottomLeft.x = x;
          break;
        case 'topRight':
          newPoints.topLeft.y = y;
          newPoints.bottomRight.x = x;
          break;
        case 'bottomRight':
          newPoints.bottomLeft.y = y;
          newPoints.topRight.x = x;
          break;
        case 'bottomLeft':
          newPoints.bottomRight.y = y;
          newPoints.topLeft.x = x;
          break;
        default:
          break;
      }
      
      return newPoints;
    });
  }, []);

  const handleMouseDown = (pointName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(pointName);
  };

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;
    handlePointDrag(isDragging, clientX, clientY);
  }, [isDragging, handlePointDrag]);

  const handleMouseMove = useCallback((e) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

  // Calculate measurements
  const calculateMeasurements = () => {
    const scaleFactor = 100; // 1% = 1cm for demonstration
    const width = Math.abs(windowPoints.topRight.x - windowPoints.topLeft.x) * scaleFactor;
    const height = Math.abs(windowPoints.bottomLeft.y - windowPoints.topLeft.y) * scaleFactor;
    const area = width * height;
    
    return { 
      width: Math.round(width * 100) / 100, 
      height: Math.round(height * 100) / 100, 
      area: Math.round(area * 100) / 100, 
      unit: 'cm' 
    };
  };

  const measurements = calculateMeasurements();

  return (
    <div className="relative w-full h-full">
      {/* Measurements Display */}
      {/* <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-sm rounded-2xl p-4 text-white border border-white/20">
        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-4 h-4 text-blue-400" />
          <span className="font-semibold">Window Measurements</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-400">Width</div>
            <div className="font-bold">{measurements.width} {measurements.unit}</div>
          </div>
          <div>
            <div className="text-gray-400">Height</div>
            <div className="font-bold">{measurements.height} {measurements.unit}</div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-400">Area</div>
            <div className="font-bold text-green-400">
              {measurements.area} {measurements.unit}²
            </div>
          </div>
        </div>
      </div> */}

      {/* Marking Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full bg-black/20 rounded-2xl overflow-hidden border-2 border-white/10 touch-none"
      >
        <img
          src={imageSrc}
          alt="Window"
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Window Outline */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Window Border */}
          <polygon
            points={`
              ${windowPoints.topLeft.x * 100}%,${windowPoints.topLeft.y * 100}%
              ${windowPoints.topRight.x * 100}%,${windowPoints.topRight.y * 100}%
              ${windowPoints.bottomRight.x * 100}%,${windowPoints.bottomRight.y * 100}%
              ${windowPoints.bottomLeft.x * 100}%,${windowPoints.bottomLeft.y * 100}%
            `}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
            strokeDasharray="8,4"
          />
          
          {/* Diagonal Lines */}
          <line
            x1={`${windowPoints.topLeft.x * 100}%`}
            y1={`${windowPoints.topLeft.y * 100}%`}
            x2={`${windowPoints.bottomRight.x * 100}%`}
            y2={`${windowPoints.bottomRight.y * 100}%`}
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <line
            x1={`${windowPoints.topRight.x * 100}%`}
            y1={`${windowPoints.topRight.y * 100}%`}
            x2={`${windowPoints.bottomLeft.x * 100}%`}
            y2={`${windowPoints.bottomLeft.y * 100}%`}
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </svg>

        {/* Corner Points */}
        {Object.entries(windowPoints).map(([pointName, point]) => (
          <motion.div
            key={pointName}
            className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-2xl shadow-blue-500/50 cursor-grab active:cursor-grabbing flex items-center justify-center"
            style={{
              left: `${point.x * 100}%`,
              top: `${point.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseDown={(e) => handleMouseDown(pointName, e)}
            onTouchStart={(e) => handleMouseDown(pointName, e)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.8 }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap capitalize">
              {pointName.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          </motion.div>
        ))}

        {/* Center Point */}
        <div
          className="absolute w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-2xl shadow-yellow-500/50 cursor-move flex items-center justify-center"
          style={{
            left: `${((windowPoints.topLeft.x + windowPoints.topRight.x) / 2) * 100}%`,
            top: `${((windowPoints.topLeft.y + windowPoints.bottomLeft.y) / 2) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging('center');
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging('center');
          }}
        >
          <Square className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm border border-white/20 text-center">
        <div>Drag corners to mark your window</div>
        <div className="text-xs text-gray-300 mt-1">Drag center to move entire window</div>
      </div>
    </div>
  );
};

/* -------- MOBILE RESPONSIVE SIDEBAR -------- */
const MobileSidebar = ({ isOpen, onClose, children }) => {
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-slate-900/95 backdrop-blur-xl border-l border-white/20 z-50 lg:hidden overflow-y-auto"
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Window Controls</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {children}
        </div>
      </motion.div>
    </>
  );
};

/* -------- UPDATED WINDOW MARKING PAGE -------- */
export function WindowMarking() {
  const location = useLocation();
  const navigate = useNavigate();
  const photo = location.state?.photo;

  const [windowData, setWindowData] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* Reset window marking */
  const resetWindow = () => {
    setWindowData(null);
  };

  /* Confirm window selection */
  const confirmWindow = () => {
    if (!windowData) return;
    
    // Save to localStorage
    localStorage.setItem("windowPhoto", photo);
    localStorage.setItem("windowData", JSON.stringify(windowData));
    
    // Show success feedback
    const event = new CustomEvent('showToast', { 
      detail: { 
        message: `Window marked successfully! ${windowData.width.toFixed(1)}×${windowData.height.toFixed(1)}cm`, 
        type: 'success' 
      } 
    });
    window.dispatchEvent(event);
    
    navigate("/category");
  };

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white text-lg p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Ruler className="w-8 h-8 text-yellow-400" />
          </div>
          <p>No photo found. Please go back to capture a window image.</p>
        </div>
      </div>
    );
  }

  /* Control Sidebar Content */
  const sidebarContent = (
    <>
      <Card className="p-4 md:p-6">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-3">
          <Ruler className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          Window Marking
        </h3>
        
        <div className="space-y-4">
          {windowData && (
            <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-2 text-sm md:text-base">Current Measurements</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-gray-400 text-xs">Width</div>
                  <div className="text-white font-bold text-sm">
                    {windowData ? `${windowData.width.toFixed(1)}cm` : '--'}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-gray-400 text-xs">Height</div>
                  <div className="text-white font-bold text-sm">
                    {windowData ? `${windowData.height.toFixed(1)}cm` : '--'}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-gray-400 text-xs">Area</div>
                  <div className="text-green-400 font-bold text-sm">
                    {windowData ? `${windowData.area.toFixed(1)}cm²` : '--'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Button
              onClick={resetWindow}
              variant="secondary"
              className="w-full py-3 md:py-4"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              Reset
            </Button>
            
            <Button
              onClick={confirmWindow}
              disabled={!windowData}
              className={cn(
                "w-full py-3 md:py-4",
                !windowData && "opacity-50 cursor-not-allowed"
              )}
            >
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              Confirm
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Tips Card */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
          <Ruler className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
          Marking Instructions
        </h3>
        <div className="space-y-2 text-xs md:text-sm text-gray-300">
          <p>• Drag corner points to mark window boundaries</p>
          <p>• Drag center point to move entire window</p>
          <p>• Real-time measurements update automatically</p>
          <p>• Ensure corners align with window edges</p>
        </div>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6 flex flex-col items-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Mobile Header with Menu Button */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-4 md:mb-8 lg:hidden relative z-20">
        <motion.div
          className="text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white">
            Mark Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Window</span>
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            Drag points to mark window corners
          </p>
        </motion.div>
        
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Header Section for Desktop */}
      <motion.div
        className="text-center mb-6 md:mb-8 relative z-10 hidden lg:block"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 border border-white/20">
          <Ruler className="w-5 h-5 text-green-400" />
          <span className="text-white/90 font-medium">Drag Points to Mark Window</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Mark Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Window</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl">
          Drag the corner points to precisely mark your window boundaries with real-time measurements
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 w-full max-w-7xl relative z-10">
        {/* Image + Marking Area */}
        <motion.div
          className="lg:flex-1 w-full"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Card className="p-4 md:p-6 relative overflow-hidden">
            <div className="w-full h-[400px] sm:h-[500px] md:h-[600px]">
              <WindowMarker
                imageSrc={photo}
                onWindowChange={setWindowData}
              />
            </div>
          </Card>
        </motion.div>

        {/* Desktop Side Controls */}
        <motion.div
          className="hidden lg:flex lg:w-96 flex-col gap-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {sidebarContent}
        </motion.div>
      </div>

      {/* Mobile Bottom Actions */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden z-30">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={resetWindow}
            variant="secondary"
            className="w-full py-3"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          
          <Button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-full py-3"
          >
            <Menu className="w-4 h-4" />
            Controls
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)}
      >
        {sidebarContent}
      </MobileSidebar>
    </div>
  );
}