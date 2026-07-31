interface NavbarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({
    isSidebarOpen,
    setIsSidebarOpen,
}: NavbarProps) {

    return (

        <nav className="top-navbar">
            <div className="navbar-left">
                <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <i className="bi bi-list"></i>
                </button>

                <h5 className="navbar-title">Dashboard</h5>
            </div>

            <div className="navbar-right">
                <div className="user-info">
                    <i className="bi bi-person-circle"></i>
                    <span>Admin</span>
                </div>
            </div>
        </nav>
    );
}