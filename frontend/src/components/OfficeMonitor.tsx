import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../services/api";

interface SensorStatus {
    label: string;
    value: string;
    status: "success" | "warning" | "danger" | "secondary" | "off";
}

export default function OfficeMonitor() {
    const [sensors, setSensors]       = useState<SensorStatus[]>([]);
    const [lastUpdate, setLastUpdate] = useState("--:--:--");

    const fetchData = useCallback(async () => {
        try {
            const data = await apiFetch("/api/sensors/office");
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
                    <h4>Office</h4>
                    <small>ESP32A · Security Monitoring</small>
                </div>
                <i className="bi bi-building"></i>
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