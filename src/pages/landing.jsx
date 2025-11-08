import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Image, Sparkles, Share2, ArrowRight, Star, CheckCircle, Zap } from "lucide-react";

function Landing() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const handleStartCapture = () => {
    setShowPopup(true);
  };

  const handlePopupContinue = () => {
    setShowPopup(false);
    navigate("/capture");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gray-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gray-100 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-black/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <header className="w-full flex justify-between items-center py-6 px-6 md:px-12 bg-transparent relative z-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-gray-800 to-black rounded-xl flex items-center justify-center shadow-lg border border-gray-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
            Curtain<span className="text-gray-600">View</span>
          </h1>
        </motion.div>
        
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          onClick={handleStartCapture}
          className="group relative bg-gradient-to-r from-black to-gray-800 text-white px-6 py-3 rounded-xl font-semibold shadow-2xl shadow-gray-500/25 hover:shadow-gray-600/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden border border-gray-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative">Try Now</span>
        </motion.button>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 relative z-10 py-50">
        <motion.h2
          className="text-5xl md:text-7xl font-bold text-black leading-tight mb-8 max-w-5xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Visualize <span className="bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">Perfect Curtains</span> Before You Buy
        </motion.h2>

        <motion.p
          className="text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
        >
          Use AI to preview how different curtain styles will look in your room. 
          No more guessing - see it live before making a purchase.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 items-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleStartCapture}
            className="group relative bg-gradient-to-r from-black to-gray-800 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-2xl shadow-gray-500/25 hover:shadow-gray-600/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden border border-gray-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative flex items-center gap-3">
              <Camera className="w-6 h-6" />
              Start Free Preview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          <button className="text-gray-700 hover:text-black font-semibold flex items-center gap-2 group transition-all duration-300">
            <Star className="w-5 h-5 fill-current" />
            Watch Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-12 mt-20"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.7 }}
        >
          {[
            { number: "50K+", label: "Happy Users" },
            { number: "100K+", label: "Previews" },
            { number: "4.9", label: "Rating" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-black mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold text-black mb-6">
              How It <span className="bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">Works</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your space in just four simple steps with our AI-powered platform
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Camera className="w-8 h-8 text-gray-700" />,
                title: "Capture Photo",
                desc: "Use your phone or webcam to take a clear window photo",
                gradient: "from-gray-200 to-gray-300",
                color: "gray"
              },
              {
                icon: <Image className="w-8 h-8 text-gray-700" />,
                title: "AI Detection",
                desc: "Smart AI automatically detects and outlines your window",
                gradient: "from-gray-200 to-gray-300",
                color: "gray"
              },
              {
                icon: <Sparkles className="w-8 h-8 text-gray-700" />,
                title: "Apply Styles",
                desc: "Choose from 50+ curtain styles with real-time preview",
                gradient: "from-gray-200 to-gray-300",
                color: "gray"
              },
              {
                icon: <Share2 className="w-8 h-8 text-gray-700" />,
                title: "Save & Share",
                desc: "Download HD renders or share with friends & designers",
                gradient: "from-gray-200 to-gray-300",
                color: "gray"
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="group relative"
                variants={fadeUp}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-500 group-hover:scale-105 h-full shadow-lg">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg border border-gray-300`}>
                    {step.icon}
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center text-white text-sm font-bold border border-gray-300">
                      {i + 1}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-black text-center mb-3">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold text-black mb-6">
              Why Choose <span className="bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">CurtainView?</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of home decoration with our cutting-edge technology
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Zap className="w-8 h-8 text-gray-700" />,
                title: "Realistic 3D Preview",
                desc: "Experience lifelike visuals that match real lighting and perspective with our advanced rendering engine",
                features: ["Light-accurate materials", "Real-time shadows", "High-resolution output"]
              },
              {
                icon: <Sparkles className="w-8 h-8 text-gray-700" />,
                title: "Instant AI Fitting",
                desc: "Smart detection auto-adjusts curtains perfectly onto your captured window in seconds",
                features: ["Auto-measurement", "Perfect fit guarantee", "Multiple style suggestions"]
              },
              {
                icon: <Share2 className="w-8 h-8 text-gray-700" />,
                title: "Share Easily",
                desc: "Save your favorite setups or send them instantly to designers and friends",
                features: ["HD downloads", "Social sharing", "Designer collaboration"]
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group relative"
                variants={fadeUp}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-500 group-hover:scale-105 h-full shadow-lg">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-gray-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-semibold text-black mb-4">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.desc}
                  </p>
                  <ul className="space-y-3">
                    {feature.features.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-16"
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleStartCapture}
              className="group bg-gradient-to-r from-black to-gray-800 text-white px-12 py-4 rounded-2xl text-lg font-semibold shadow-2xl shadow-gray-500/25 hover:shadow-gray-600/40 transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-300"
            >
              <div className="flex items-center gap-3">
                Start Your Project Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-gray-200 relative z-10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-800 to-black rounded-xl flex items-center justify-center shadow-lg border border-gray-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                CurtainView
              </h4>
            </div>
            <p className="text-gray-600 max-w-md mx-auto">
              Transforming home decoration with AI-powered visualization technology
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-sm"
          >
            © {new Date().getFullYear()} CurtainView. All rights reserved.
          </motion.div>
        </div>
      </footer>

      {/* Enhanced Popup Modal */}
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-300 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-800 to-black rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-300">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Before You Start</h3>
              <p className="text-gray-600 leading-relaxed">
                Take 3 feet back from the window and make sure the camera and window are aligned straight. 
                Good lighting helps AI work better!
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <ul className="text-black text-sm space-y-2">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-700" />
                  Stand 3 feet away from window
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-700" />
                  Keep camera straight and level
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gray-700" />
                  Ensure good lighting
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePopupContinue}
                className="flex-1 bg-gradient-to-r from-black to-gray-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300 hover:scale-105 border border-gray-300"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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

export default Landing;