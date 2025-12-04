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
  ZoomIn,
  ZoomOut,
  Move,
  Grid3x3
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
        ? "bg-gray-700 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500/50 shadow-blue-500/25" 
        : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400 focus:ring-gray-500/50 shadow-gray-500/25 border border-gray-300",
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
      "bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-2xl p-4 md:p-6",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/* -------- IMAGE MANIPULATION COMPONENT -------- */
const ImageManipulator = ({ 
  imageSrc, 
  onImageConfirm
}) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showGrid, setShowGrid] = useState(false); // Grid hidden by default
  const [lastDistance, setLastDistance] = useState(null);

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

  // Load image dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Calculate 4x4 grid dimensions
  const gridSize = 4; // 4x4 grid
  const cellWidth = containerSize.width / gridSize;
  const cellHeight = containerSize.height / gridSize;

  // Reset function
  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Calculate constraints for image movement
  const getConstraints = () => {
    const containerWidth = containerSize.width;
    const containerHeight = containerSize.height;
    
    // Calculate image dimensions at current scale
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    
    // Calculate maximum movement to keep image within bounds
    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);
    
    return { maxX, maxY };
  };

  // Handle mouse/touch events for dragging
  const handleStart = useCallback((clientX, clientY) => {
    setIsDragging(true);
    setLastMousePos({ x: clientX, y: clientY });
  }, []);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;

    const deltaX = clientX - lastMousePos.x;
    const deltaY = clientY - lastMousePos.y;

    const constraints = getConstraints();
    
    setPosition(prev => {
      let newX = prev.x + deltaX;
      let newY = prev.y + deltaY;

      // Apply constraints
      if (constraints.maxX > 0) {
        newX = Math.max(-constraints.maxX, Math.min(constraints.maxX, newX));
      } else {
        newX = 0;
      }

      if (constraints.maxY > 0) {
        newY = Math.max(-constraints.maxY, Math.min(constraints.maxY, newY));
      } else {
        newY = 0;
      }

      return { x: newX, y: newY };
    });

    setLastMousePos({ x: clientX, y: clientY });
  }, [isDragging, lastMousePos, scale, imageSize, containerSize]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch event handlers for multi-touch (pinch zoom)
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch for dragging
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
      // Two touches for pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastDistance(distance);
    }
  }, [handleStart]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch dragging
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2 && lastDistance !== null) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const delta = currentDistance - lastDistance;
      const zoomFactor = 1 + delta * 0.01; // Adjust sensitivity
      
      setScale(prev => {
        const newScale = Math.max(0.5, Math.min(5, prev * zoomFactor));
        
        // Calculate center point between two touches for zoom origin
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // Adjust position to zoom towards center point
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const relativeX = centerX - rect.left - containerSize.width / 2;
          const relativeY = centerY - rect.top - containerSize.height / 2;
          
          const scaleFactor = newScale / prev;
          setPosition(prevPos => ({
            x: prevPos.x * scaleFactor + (1 - scaleFactor) * relativeX,
            y: prevPos.y * scaleFactor + (1 - scaleFactor) * relativeY
          }));
        }
        
        return newScale;
      });
      
      setLastDistance(currentDistance);
    }
  }, [handleMove, lastDistance, containerSize]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length < 2) {
      setLastDistance(null);
    }
    handleEnd();
  }, [handleEnd]);

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle wheel for zoom (disabled as per request, but keeping for desktop fallback)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    // Disabled - only touch zoom allowed
  }, []);

  // Calculate which 4x4 cell is at the center
  const getCenterCell = () => {
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    
    const cellX = Math.floor(centerX / cellWidth);
    const cellY = Math.floor(centerY / cellHeight);
    
    return { x: cellX, y: cellY };
  };

  const centerCell = getCenterCell();

  return (
    <div className="relative w-full h-full">
      {/* Image Container - Clean, no overlay text */}
      <div
        ref={containerRef}
        className="relative w-full h-full bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-300 touch-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Window"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none"
            style={{
              transformOrigin: 'center',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
        </div>

        {/* 4x4 Grid Overlay - Only when enabled */}
        {showGrid && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Vertical grid lines */}
            {Array.from({ length: gridSize - 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${((i + 1) * 100) / gridSize}%`}
                y1="0%"
                x2={`${((i + 1) * 100) / gridSize}%`}
                y2="100%"
                stroke="rgba(0, 0, 0, 0.2)"
                strokeWidth="1"
              />
            ))}
            
            {/* Horizontal grid lines */}
            {Array.from({ length: gridSize - 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0%"
                y1={`${((i + 1) * 100) / gridSize}%`}
                x2="100%"
                y2={`${((i + 1) * 100) / gridSize}%`}
                stroke="rgba(0, 0, 0, 0.2)"
                strokeWidth="1"
              />
            ))}
            
            {/* Center cell highlight */}
            <rect
              x={`${centerCell.x * 100 / gridSize}%`}
              y={`${centerCell.y * 100 / gridSize}%`}
              width={`${100 / gridSize}%`}
              height={`${100 / gridSize}%`}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            
            {/* Cell labels */}
            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
              const row = Math.floor(i / gridSize);
              const col = i % gridSize;
              const label = `${String.fromCharCode(65 + row)}${col + 1}`;
              
              return (
                <text
                  key={label}
                  x={`${(col * 100 / gridSize) + 2}%`}
                  y={`${(row * 100 / gridSize) + 5}%`}
                  className="text-xs fill-black/70 font-mono font-bold"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        )}

        {/* Center marker - subtle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
          <div className="w-full h-full border-2 border-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* Simple instructions at bottom */}
      <div className="mt-2 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center gap-2">
          
          {showGrid && (
            <>
              <Grid3x3 className="w-4 h-4 ml-2" />
              <span>Center: {String.fromCharCode(65 + centerCell.y)}{centerCell.x + 1}</span>
            </>
          )}
        </div>
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white/95 backdrop-blur-xl border-l border-gray-200 z-50 lg:hidden overflow-y-auto"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Image Controls</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
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

/* -------- UPDATED IMAGE MANIPULATION PAGE -------- */
export function WindowMarking() {
  const location = useLocation();
  const navigate = useNavigate();
  const photo = location.state?.photo;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* Confirm image selection */
  const confirmImage = () => {
    if (!photo) return;
    
    // Save to localStorage
    localStorage.setItem("windowPhoto", photo);
    
    // Show success feedback
    const event = new CustomEvent('showToast', { 
      detail: { 
        message: "Image position confirmed!",
        type: 'success' 
      } 
    });
    window.dispatchEvent(event);
    
    navigate("/category");
  };

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 text-gray-900 text-lg p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Grid3x3 className="w-8 h-8 text-blue-600" />
          </div>
          <p>No photo found. Please go back to capture an image.</p>
        </div>
      </div>
    );
  }

  /* Control Sidebar Content */
  const sidebarContent = (
    <>
      <Card className="p-4 md:p-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-3">
          <Grid3x3 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          Image Positioning
        </h3>
        
        <div className="space-y-4">
          

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Button
              onClick={() => {
                // Reset button functionality
                const event = new CustomEvent('resetImageTransform');
                window.dispatchEvent(event);
              }}
              variant="secondary"
              className="w-full py-3 md:py-4"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              Reset View
            </Button>
            
            <Button
              onClick={confirmImage}
              className="w-full py-3 md:py-4"
            >
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              Confirm
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid Information Card */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          4x4 Grid Reference
        </h3>
        <div className="space-y-2 text-xs md:text-sm text-gray-700">
          <p>• Grid divides image into 16 equal cells</p>
          <p>• Center cell is highlighted in blue</p>
          <p>• Cells labeled A1 through D4</p>
          <p>• Position important elements in center cell</p>
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <div className="font-bold text-gray-900 text-center">Default Center Cell</div>
            <div className="text-2xl font-bold text-center text-blue-600 mt-1">
              B2
            </div>
          </div>
        </div>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-4 md:p-6 flex flex-col items-center relative overflow-hidden">
      {/* Animated Background Elements - Subtle */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Header with Menu Button */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-4 md:mb-8 lg:hidden relative z-20">
        <motion.div
          className="text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Position Your <span className="text-gray-900 bg-clip-text ">Image</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Drag and pinch to position your image
          </p>
        </motion.div>
        
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-3 rounded-2xl bg-gray-100 backdrop-blur-sm border border-gray-200 hover:bg-gray-200 transition-all duration-300"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Header Section for Desktop */}
      <motion.div
        className="text-center mb-6 md:mb-8 relative z-10 hidden lg:block"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 border border-gray-200">
          <Grid3x3 className="w-5 h-5 text-green-600" />
          <span className="text-gray-700 font-medium">Drag & Pinch to Position Image</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Position Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Image</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl">
          Drag to pan, pinch to zoom, and position your image as needed
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 w-full max-w-7xl relative z-10">
        {/* Image Manipulation Area */}
        <motion.div
          className="lg:flex-1 w-full"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Card className="p-4 md:p-6 relative overflow-hidden">
            <div className="w-full h-[400px] sm:h-[500px] md:h-[600px]">
              <ImageManipulator
                imageSrc={photo}
                onImageConfirm={confirmImage}
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

      {/* Mobile Bottom Actions - UPDATED: Controls button replaced with Confirm button */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden z-30">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => {
              // Reset button functionality for mobile
              const event = new CustomEvent('resetImageTransform');
              window.dispatchEvent(event);
            }}
            variant="secondary"
            className="w-full py-3"
          >
            <RotateCcw className="w-4 h-4" />
            Reset View
          </Button>
          
          {/* UPDATED: Controls button replaced with Confirm button */}
          <Button
            onClick={confirmImage}
            className="w-full py-3"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm Image
            <ArrowRight className="w-4 h-4" />
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