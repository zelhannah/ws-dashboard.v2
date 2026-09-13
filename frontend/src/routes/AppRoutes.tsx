import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login      from "../pages/Login";
import Dashboard  from "../pages/Dashboard";
import Monitoring from "../pages/Monitoring";
import Alerts     from "../pages/Alerts";
import Users      from "../pages/Users";
import Management from "../pages/Management";
import Education  from "../pages/Education";
import EmergencyControl from "../pages/EmergencyControl";

import MainLayout     from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";


export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<MainLayout />}>
                    <Route path="/dashboard"  element={<ProtectedRoute><Dashboard  /></ProtectedRoute>} />
                    <Route path="/management"    element={<ProtectedRoute><Management /></ProtectedRoute>} />
                    <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
                    <Route path="/emergency"  element={<ProtectedRoute><EmergencyControl /></ProtectedRoute>} />
                    <Route path="/alerts"     element={<ProtectedRoute><Alerts     /></ProtectedRoute>} />
                    <Route path="/users"      element={<ProtectedRoute><Users      /></ProtectedRoute>} />
                    <Route path="/education"  element={<ProtectedRoute><Education  /></ProtectedRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}