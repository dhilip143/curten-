import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import CapturePage from "./pages/Capture";
import { WindowMarking } from "./pages/WindowMarking";
import { CategoryBrowse } from "./pages/CatalogBrowser";
import Curtain3D from "./pages/Curtain3D";
import Blind3D from "./pages/Blind3D";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/window" element={<WindowMarking />} />
        <Route path="/category" element={<CategoryBrowse />} />
        <Route path="/curtain3d" element={<Curtain3D />} />
        <Route path="/blind3d" element={<Blind3D />} />
      </Routes>
    </Router>
  );
} 

export default App;