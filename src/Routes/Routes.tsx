import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";
import { PrivateRoute } from "./PrivateRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ConfirmEmail from "../pages/ConfirmEmail";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Invest from "../pages/Invest";
import SimpleJ from "../pages/SimpleJ";
import ComposeJ from "../pages/ComposeJ";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/invest/simples" element={<SimpleJ />} />
            <Route path="/invest/composto" element={<ComposeJ />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
