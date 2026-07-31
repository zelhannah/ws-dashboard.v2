import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../services/api";

interface SensorStatus {
    label: string;
    value: string;
    status: "success" | "warning" | "danger" | "secondary" | "off";
}

interface ZoneMonitorProps {
    zone: "office" | "warehouse";
}

export default function ZoneMonitor({ zone }: ZoneMonitorProps) {
    const [sensors, setSensors] = useState<SensorStatus[]>([]);
    const [lastUpdate, setLastUpdate] = useState("--:--:--");

    const config = {
        office: {
            title: "Office",
            subtitle: "ESP32A · Security Monitoring",
            endpoint: "/api/sensors/office",
            icon: "bi-building",
        },
        warehouse: {
            title: "Warehouse",
            subtitle: "ESP32B · Security Monitoring",
            endpoint: "/api/sensors/warehouse",
            icon: "bi-box-seam",
        },
    };

    const current = config[zone];

    const fetchData = useCallback(async () => {
        try {
            const data = await apiFetch(current.endpoint);

            if (Array.isArray(data)) {
                setSensors(data);
            }

            setLastUpdate(new Date().toLocaleTimeString());
        } catch {
            setLastUpdate(new Date().toLocaleTimeString());
        }
    }, [current.endpoint]);

    useEffect(() => {
        void fetchData();

        const interval = setInterval(() => {
            void fetchData();
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchData]);

    return (
        <div className="monitor-card dashboard-monitor">
            <div className="monitor-header">
                <div>
                    <h4>{current.title}</h4>
                    <small>{current.subtitle}</small>
                </div>

                <i className={`bi ${current.icon}`}></i>
            </div>

            <div className="monitor-body">
                {sensors.length === 0 ? (
                    <div className="text-center text-muted py-3">
                        Loading sensors...
                    </div>
                ) : (
                    sensors.map((item) => (
                        <div key={item.label} className="monitor-item">
                            <span>{item.label}</span>

                            <span
                                className={`status-badge status-${item.status}`}
                            >
                                {item.value}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <div className="monitor-footer">
                <span>Last Update</span>
                <strong>{lastUpdate}</strong>
            </div>
        </div>
    );
}