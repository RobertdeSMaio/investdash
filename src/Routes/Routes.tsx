import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import NavBar from "../componentes/NavBar";
import About from "../pages/About";
import ComposeJ from "../pages/ComposeJ";
import Home from "../pages/Home";
import Invest from "../pages/Invest";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SimpleJ from "../pages/SimpleJ";

const PageLayout = () => {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <NavBar />
      <main className="flex-1 p-5 overflow-y-auto bg-slate-100">
        <Outlet />
      </main>
    </div>
  );
};

export default function Rout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route element={<PageLayout />}>
          <Route path="/about" element={<About />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/simplej" element={<SimpleJ />} />
          <Route path="/composej" element={<ComposeJ />} />
          <Route path="/home" element={<Home />} />
        </Route>
        <Route
          path="*"
          element={<h1>Página não encontrada! Verifique a URL.</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
}
