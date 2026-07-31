import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../assets/css/layout.css";

export default function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="layout">
            <Navbar isSidebarOpen={isSidebarOpen}setIsSidebarOpen={setIsSidebarOpen} />

            <div className="layout-body">
                <Sidebar isSidebarOpen={isSidebarOpen}/>
                <main className="content"><Outlet /></main>
            </div>
        </div>
    );
}