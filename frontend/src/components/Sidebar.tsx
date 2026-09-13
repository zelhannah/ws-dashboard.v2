import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

interface SidebarProps {
    isSidebarOpen: boolean;
}

const menus = [
    { title: "Dashboard", icon: "bi-speedometer2", path: "/dashboard" },
    { title: "Management", icon: "bi-diagram-3", path: "/management" },
    { title: "Monitoring", icon: "bi-activity", path: "/monitoring" },
    { title: "Emergency Control", icon: "bi-exclamation-octagon", path: "/emergency"  },
    { title: "Activity Records", icon: "bi-shield-exclamation", path: "/alerts" },
    { title: "Users", icon: "bi-people", path: "/users"},
    { title: "Education", icon: "bi-mortarboard", path: "/education"  },
];

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem("user");
            localStorage.removeItem("loggedIn");
            navigate("/");
        } catch (error) {
            console.error(error);
            alert("Logout failed");
        }
    };

    return (
        <aside className={`sidebar ${isSidebarOpen ? "expanded" : "collapsed"}`}>

            <div className="sidebar-logo">
                <i className="bi bi-shield-check"></i>
                {isSidebarOpen && <span>WARESAFE</span>}
            </div>

            <div className="sidebar-menu">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.title}
                        to={menu.path}
                        className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                    >
                        <i className={`bi ${menu.icon}`}></i>
                        {isSidebarOpen && <span>{menu.title}</span>}
                    </NavLink>
                ))}
            </div>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    {isSidebarOpen && <span>Logout</span>}
                </button>
            </div>

        </aside>
    );
}