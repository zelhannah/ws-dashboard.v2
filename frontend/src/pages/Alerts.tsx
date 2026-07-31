import "../assets/css/page.css";
import SecurityEvent from "../components/AlertTable";

export default function Alerts() {
    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Alerts</h2>
                    <p>View and manage all security events.</p>
                </div>
            </div>

            <SecurityEvent />
        </>
    );
}