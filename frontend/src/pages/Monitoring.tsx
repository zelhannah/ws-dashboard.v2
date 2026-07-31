import "../assets/css/page.css";
import "../assets/css/dashboard.css";

import { useEffect, useState, useCallback } from "react";

import OfficeMonitor from "../components/OfficeMonitor";
import WarehouseMonitor from "../components/WarehouseMonitor";
import { getOfficeHistory, getWarehouseHistory } from "../services/api";

interface Activity {
    id: number;
    time: string;
    device: string;
    status: string;
    color: string;
}

export default function Monitoring() {
    const [tab, setTab] = useState<"office" | "warehouse">("office");
    const [officeLogs, setOfficeLogs] = useState<Activity[]>([]);
    const [warehouseLogs, setWarehouseLogs] = useState<Activity[]>([]);

    const fetchLogs = useCallback(async () => {
        try {
            const [office, warehouse] = await Promise.all([
                getOfficeHistory(),
                getWarehouseHistory(),
            ]);
            if (Array.isArray(office)) setOfficeLogs(office);
            if (Array.isArray(warehouse)) setWarehouseLogs(warehouse);
        } catch {
            // keep whatever was already loaded
        }
    }, []);

    useEffect(() => {
        void fetchLogs();
        const interval = setInterval(() => { void fetchLogs(); }, 5000);
        return () => clearInterval(interval);
    }, [fetchLogs]);

    const logs = tab === "office" ? officeLogs : warehouseLogs;

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Monitoring</h2>
                    <p>Monitor real-time Office and Warehouse sensors.</p>
                </div>
            </div>

            <div className="mb-4">
                <div className="btn-group">
                    <button
                        className={`btn ${tab === "office" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setTab("office")}
                    >
                        Office
                    </button>

                    <button
                        className={`btn ${tab === "warehouse" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setTab("warehouse")}
                    >
                        Warehouse
                    </button>
                </div>
            </div>

            <div className="mb-4">
                {tab === "office" ? <OfficeMonitor /> : <WarehouseMonitor />}
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Realtime Activity</h5>
                </div>

                <div
                    className="card-body"
                    style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                    {logs.map((item) => (
                        <div
                            key={item.id}
                            className="d-flex justify-content-between align-items-center py-3 border-bottom"
                        >
                            <div>
                                <h6 className="mb-1">{item.device}</h6>
                                <small className="text-muted">{item.time}</small>
                            </div>

                            <span
                                className={`badge bg-${item.color}`}
                                style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                            >
                                {item.status}
                            </span>
                        </div>
                    ))}

                    {logs.length === 0 && (
                        <div className="text-center text-muted py-5">
                            No activity available.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
