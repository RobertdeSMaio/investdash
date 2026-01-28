import { BrowserRouter, Route, Routes } from "react-router-dom";
import ComposeJ from "../pages/ComposeJ";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SimpleJ from "../pages/SimpleJ";

export default function Rout() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/SimpleJ" element={<SimpleJ />} />
          <Route path="/ComposeJ" element={<ComposeJ />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
