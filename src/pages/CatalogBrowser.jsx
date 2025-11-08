import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Filter, Sparkles, Star, ChevronRight } from "lucide-react";

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

const ArrowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export function CategoryBrowse() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
  { 
    id: 1, 
    name: "Modern Curtains", 
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80", 
    description: "Sleek contemporary designs for modern spaces",
    styles: ["Minimalist", "Geometric", "Industrial"],
    rating: 4.8,
    modelPath: "/3d_curtain/scene.gltf",
    modelType: "curtain"
  },
  { 
    id: 2, 
    name: "Classic Drapes", 
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80", 
    description: "Timeless traditional styles with elegant drapes",
    styles: ["Traditional", "Victorian", "French Pleat"],
    rating: 4.6,
    modelPath: "/Blindes_window.glb",
    modelType: "blind"
  },
  { 
    id: 3, 
    name: "Sheer Collection", 
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", 
    description: "Light and airy fabrics for soft natural light",
    styles: ["Voile", "Linen", "Organza"],
    rating: 4.7,
    modelPath: "/3d_curtain/scene.gltf",
    modelType: "curtain"
  },
  { 
    id: 4, 
    name: "Velvet Style", 
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80", 
    description: "Luxurious textured curtains for opulent spaces",
    styles: ["Crushed", "Panelled", "Jacquard"],
    rating: 4.9,
    modelPath: "/3d_curtain/scene.gltf",
    modelType: "curtain"
  },
  { 
    id: 5, 
    name: "Patterned Curtains", 
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80", 
    description: "Beautiful printed designs with vibrant patterns",
    styles: ["Floral", "Paisley", "Striped"],
    rating: 4.5,
    modelPath: "/3d_curtain/scene.gltf",
    modelType: "curtain"
  },
  { 
    id: 6, 
    name: "Minimal Designs", 
    img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80", 
    description: "Clean and simple aesthetics for modern living",
    styles: ["Plain", "Textured", "Ribbed"],
    rating: 4.8,
    modelPath: "/3d_curtain/scene.gltf",
    modelType: "curtain"
  },
  { 
    id: 7, 
    name: "Kids Curtains", 
    img: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=800&q=80", 
    description: "Fun and colorful patterns for children's rooms",
    styles: ["Cartoon", "Themed", "Educational"],
    rating: 4.7,
    modelPath: "/3d_curtain/scene.gltf",
    modelType: "curtain"
  },
  { 
    id: 8, 
    name: "Luxury Collection", 
    img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80", 
    description: "Premium exclusive designs with custom finishes",
    styles: ["Silk", "Brocade", "Custom"],
    rating: 5.0,
    modelPath: "/3d_curtain/scene.gltf",
    modelType: "curtain"
  },
  { 
    id: 9, 
    name: "Outdoor Drapes", 
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80", 
    description: "Weather-resistant fabrics for outdoor spaces",
    styles: ["UV Resistant", "Waterproof", "Mold Resistant"],
    rating: 4.6,
    modelPath: "/Blindes_window.glb",
    modelType: "blind"
  },
];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.styles.some(style => style.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCategorySelect = (category) => {
    // Navigate to the appropriate 3D page based on model type
    const targetRoute = category.modelType === "curtain" ? "/curtain3d" : "/blind3d";
    
    navigate(targetRoute, { 
      state: { 
        selectedCategory: category,
        modelPath: category.modelPath,
        modelType: category.modelType
      } 
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white py-12 px-6 relative overflow-hidden">
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-6"
            variants={itemVariants}
          >
            Discover Your <span className="bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">Perfect Style</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Explore our curated collection of premium curtain categories and find the perfect match that transforms your space
          </motion.p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-12 max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={itemVariants}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search styles, materials, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl pl-12 pr-4 py-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 shadow-lg"
            />
          </div>
          <button className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl px-6 py-4 text-gray-800 hover:bg-white transition-all duration-300 flex items-center gap-3 shadow-lg">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              className="group relative"
              variants={itemVariants}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div
                className="relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-500 group-hover:scale-105 cursor-pointer h-full shadow-xl"
                onClick={() => handleCategorySelect(category)}
              >
                {/* Model Type Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border",
                    category.modelType === "curtain" 
                      ? "bg-gray-600/20 text-gray-700 border-gray-600/30" 
                      : "bg-gray-500/20 text-gray-700 border-gray-500/30"
                  )}>
                    {category.modelType === "curtain" ? "Curtain" : "Blind"}
                  </div>
                </div>

                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={category.img}
                    alt={category.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-white text-sm font-semibold">{category.rating}</span>
                  </div>

                  {/* Hover Action */}
                  <div className="absolute top-4 right-12 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <div className={cn(
                      "rounded-full p-3 shadow-2xl",
                      category.modelType === "curtain" 
                        ? "bg-gradient-to-r from-gray-700 to-black shadow-gray-500/25" 
                        : "bg-gradient-to-r from-gray-600 to-gray-800 shadow-gray-500/25"
                    )}>
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Category Name Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gray-200 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {category.styles.map((style, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-300"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">
                      {category.styles.length} styles available
                    </span>
                    <div className={cn(
                      "flex items-center gap-1 transition-colors",
                      category.modelType === "curtain" 
                        ? "text-gray-600 group-hover:text-gray-800" 
                        : "text-gray-600 group-hover:text-gray-800"
                    )}>
                      <span className="text-sm font-medium">
                        {category.modelType === "curtain" ? "Customize Curtain" : "Customize Blind"}
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-4xl mx-auto border border-gray-300 relative overflow-hidden shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 25px 25px, black 2%, transparent 0%), radial-gradient(circle at 75px 75px, black 2%, transparent 0%)`,
                backgroundSize: '100px 100px'
              }}></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Need Something Special?
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Our design experts can create custom curtains tailored to your exact specifications, preferences, and space requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="px-10 py-4 text-lg shadow-2xl shadow-gray-500/25">
                  Contact Design Consultant
                  <ArrowIcon />
                </Button>
                <Button variant="secondary" className="px-10 py-4 text-lg">
                  Schedule Virtual Consultation
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

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