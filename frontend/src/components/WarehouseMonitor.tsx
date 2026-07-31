import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../services/api";

interface SensorStatus {
    label: string;
    value: string;
    status: "success" | "warning" | "danger" | "off";
}

export default function WarehouseMonitor() {
    const [sensors, setSensors] = useState<SensorStatus[]>([]);
    const [lastUpdate, setLastUpdate] = useState("--:--:--");

    const fetchData = useCallback(async () => {
        try {
            const data = await apiFetch("/api/sensors/warehouse");
            if (Array.isArray(data) && data.length > 0) {
                setSensors(data);
            }
            setLastUpdate(new Date().toLocaleTimeString());
        } catch {
            setLastUpdate(new Date().toLocaleTimeString());
        }
    }, []);

    useEffect(() => {
        void fetchData();
        const interval = setInterval(() => { void fetchData(); }, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return (
        <div className="monitor-card dashboard-monitor">
            <div className="monitor-header">
                <div>
                    <h4>Warehouse</h4>
                    <small>ESP32B · Security Monitoring</small>
                </div>
                <i className="bi bi-box-seam"></i>
            </div>

            <div className="monitor-body">
                {sensors.length === 0 ? (
                    <div className="text-center text-muted py-3">Loading sensors…</div>
                ) : sensors.map((item) => (
                    <div key={item.label} className="monitor-item">
                        <span>{item.label}</span>
                        <span className={`status-badge status-${item.status}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="monitor-footer">
                <span>Last Update</span>
                <strong>{lastUpdate}</strong>
            </div>
        </div>
    );
}