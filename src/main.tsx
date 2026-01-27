import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import ComposeJ from "./pages/ComposeJ";
import Home from "./pages/Home";
import Login from "./pages/Login";
import M1 from "./pages/m1";
import Porcent from "./pages/porcent";
import Register from "./pages/Register";
import SimpleJ from "./pages/SimpleJ";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/SimpleJ" element={<SimpleJ />} />
        <Route path="/ComposeJ" element={<ComposeJ />} />
        <Route path="/M1Calc" element={<M1 />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Porc" element={<Porcent />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
