import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Button = React.forwardRef(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 active:scale-95 shadow-lg",
      variant === "primary"
        ? "bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-700 hover:to-gray-900 focus:ring-gray-500/50 shadow-gray-500/25 border border-gray-700"
        : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400 focus:ring-gray-400/50 shadow-gray-400/25 border border-gray-300",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";

const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FlipIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const RetakeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ContinueIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default function CapturePage() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraLoaded, setCameraLoaded] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);

  // Refs for GSAP animations
  const topLineRef = useRef(null);
  const bottomLineRef = useRef(null);
  const leftLineRef = useRef(null);
  const rightLineRef = useRef(null);
  const frameGlowRef = useRef(null);
  const instructionRef = useRef(null);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => setCameraLoaded(true);
        }
      } catch (err) {
        console.error(err);
        alert("Camera permission required to capture photos.");
      }
    }
    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // GSAP Animation Setup
  useEffect(() => {
    if (!photo && cameraLoaded) {
      // Create the main timeline
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      // Pulsating glow effect for the entire frame
      tl.to(frameGlowRef.current, {
        opacity: 0.8,
        scale: 1.02,
        duration: 1.5,
        ease: "sine.inOut"
      }, 0);

      // Sequential line animations with different effects
      tl.to(topLineRef.current, {
        scaleX: 1.1,
        boxShadow: "0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #6b7280",
        duration: 0.8,
        ease: "power2.out"
      }, 0)
        .to(bottomLineRef.current, {
          scaleX: 1.1,
          boxShadow: "0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #6b7280",
          duration: 0.8,
          ease: "power2.out"
        }, 0.2)
        .to(leftLineRef.current, {
          scaleY: 1.1,
          boxShadow: "0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #6b7280",
          duration: 0.8,
          ease: "power2.out"
        }, 0.4)
        .to(rightLineRef.current, {
          scaleY: 1.1,
          boxShadow: "0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #6b7280",
          duration: 0.8,
          ease: "power2.out"
        }, 0.6);

      // Additional sparkle effects
      const sparkleTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

      // Create corner sparkles
      ["top-left", "top-right", "bottom-left", "bottom-right"].forEach((corner, index) => {
        sparkleTl.to(`.sparkle-${corner}`, {
          scale: 2,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        }, index * 0.5)
          .to(`.sparkle-${corner}`, {
            scale: 1,
            opacity: 0.3,
            duration: 0.3,
            ease: "power2.in"
          }, index * 0.5 + 0.3);
      });

      return () => {
        tl.kill();
        sparkleTl.kill();
      };
    }
  }, [photo, cameraLoaded]);

  // Instruction popup animation and auto-hide
  useEffect(() => {
    if (showInstruction && cameraLoaded) {
      // Animate instruction popup
      gsap.fromTo(instructionRef.current,
        {
          opacity: 0,
          scale: 0.8,
          y: 20
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)"
        }
      );

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        gsap.to(instructionRef.current, {
          opacity: 0,
          scale: 0.8,
          y: -20,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => setShowInstruction(false)
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showInstruction, cameraLoaded]);

  const capturePhoto = () => {
    setIsCapturing(true);

    // Kill animations when capturing
    gsap.killTweensOf([topLineRef.current, bottomLineRef.current, leftLineRef.current, rightLineRef.current, frameGlowRef.current]);
    gsap.killTweensOf(".sparkle-corner");

    setTimeout(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/png");
      setPhoto(imageData);
      setIsCapturing(false);
    }, 200);
  };

  const handleRetake = () => {
    setPhoto(null);
    setShowInstruction(true);
  };

  const handleContinue = () => {
    navigate("/window", { state: { photo } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-100 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-black/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-3 backdrop-blur-sm px-6 py-4 mb-6">

        </div>
      </div>

      <div className="relative w-full max-w-lg mb-12 z-10">



        {/* Camera Frame with Enhanced Design */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-2 border border-gray-300">
          {/* Animated Glow Overlay */}
          <div
            ref={frameGlowRef}
            className="absolute inset-2 rounded-2xl overflow-hidden z-0 pointer-events-none opacity-0"
            style={{
              background: "radial-gradient(circle at center, rgba(107, 114, 128, 0.3) 0%, transparent 70%)"
            }}
          />

          {/* Camera Lens Effect */}
          <div className="absolute inset-2 rounded-2xl overflow-hidden z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-500/20 mix-blend-overlay"></div>
          </div>

          {!photo ? (
            <div className="relative rounded-2xl overflow-hidden bg-black">
              {/* Camera Grid Overlay */}
              <div className="absolute inset-0 z-10 opacity-20 pointer-events-none">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/30"></div>
                  ))}
                </div>
              </div>

              {/* Animated White Frame Lines */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Top Line */}
                <div
                  ref={topLineRef}
                  className="absolute top-[18%] left-[20%] w-[60%] h-[2px] bg-white transform -translate-y-1/2 origin-center"
                />

                {/* Bottom Line */}
                <div
                  ref={bottomLineRef}
                  className="absolute top-[66%] left-[20%] w-[60%] h-[2px] bg-white transform -translate-y-1/2 origin-center"
                />

                {/* Left Line */}
                <div
                  ref={leftLineRef}
                  className="absolute top-[18%] left-[20%] w-[2px] h-[48%] bg-white origin-center"
                />

                {/* Right Line */}
                <div
                  ref={rightLineRef}
                  className="absolute top-[18%] right-[20%] w-[2px] h-[48%] bg-white origin-center"
                />

                {/* Corner Sparkles */}
                <div className="sparkle-top-left absolute top-[18%] left-[20%] w-3 h-3 bg-white rounded-full opacity-30 transform -translate-x-1/2 -translate-y-1/2" />
                <div className="sparkle-top-right absolute top-[18%] right-[20%] w-3 h-3 bg-white rounded-full opacity-30 transform translate-x-1/2 -translate-y-1/2" />
                <div className="sparkle-bottom-left absolute top-[66%] left-[20%] w-3 h-3 bg-white rounded-full opacity-30 transform -translate-x-1/2 translate-y-1/2" />
                <div className="sparkle-bottom-right absolute top-[66%] right-[20%] w-3 h-3 bg-white rounded-full opacity-30 transform translate-x-1/2 translate-y-1/2" />

                {/* Center Guide Text */}
                <div className="absolute pt-107 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 animate-pulse">
                    <span className="text-white text-sm font-medium">
                      Align window here
                    </span>
                  </div>
                </div>
              </div>

              {/* Camera Status Bar */}
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <div className={`w-2 h-2 rounded-full ${cameraLoaded ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                  <span className="text-white text-sm font-medium">
                    {cameraLoaded ? 'REC' : 'Loading...'}
                  </span>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <span className="text-white text-sm font-medium">HD</span>
                </div>
              </div>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full aspect-[3/4] object-cover transition-all duration-500 ${isCapturing ? 'opacity-60 scale-105' : 'opacity-100'
                  } ${cameraLoaded ? 'blur-0' : 'blur-md'}`}
              />

              {isCapturing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-white text-lg font-semibold">Capturing...</p>
                  </div>
                </div>
              )}

              {/* Camera Shutter Effect */}
              {isCapturing && (
                <div className="absolute inset-0 bg-white animate-ping opacity-20 pointer-events-none"></div>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black">
              <img
                src={photo}
                alt="Captured"
                className="w-full aspect-[3/4] object-cover transition-transform duration-500 hover:scale-105"
              />
              {/* Photo Overlay Effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                <span className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  📸 Photo Preview
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Camera Frame Decoration */}
        <div className="absolute -inset-6 border border-gray-300 rounded-4xl pointer-events-none shadow-2xl"></div>
        <div className="absolute -inset-8 border border-gray-400/20 rounded-4xl pointer-events-none"></div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 mt-8 relative z-10">
        {!photo ? (
          <>
            <Button
              onClick={capturePhoto}
              disabled={isCapturing || !cameraLoaded}
              className="min-w-[200px] py-5 text-lg shadow-2xl shadow-gray-500/25"
            >
              <CameraIcon />
              {isCapturing ? "Capturing..." : cameraLoaded ? "Capture Photo" : "Loading Camera..."}
            </Button>
            <Button
              onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))}
              variant="secondary"
              className="min-w-[200px] py-5 text-lg"
              disabled={isCapturing}
            >
              <FlipIcon />
              Flip Camera
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleRetake}
              variant="secondary"
              className="min-w-[200px] py-5 text-lg"
            >
              <RetakeIcon />
              Retake Photo
            </Button>
            <Button
              onClick={handleContinue}
              className="min-w-[200px] py-5 text-lg shadow-2xl shadow-gray-500/25"
            >
              Continue
              <ContinueIcon />
            </Button>
          </>
        )}
      </div>

      {/* Enhanced Status Indicator */}
      <div className="mt-8 flex items-center gap-3 px-6 py-4 relative z-10">
        <div className={`w-3 h-3 rounded-full ${!photo ? (cameraLoaded ? 'bg-green-400' : 'bg-yellow-400') : 'bg-gray-600'
          }`} />
        <span className="text-gray-700 font-medium">
          {!photo ? (cameraLoaded ? 'Camera Ready' : 'Camera Loading...') : 'Photo Captured'}
        </span>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}