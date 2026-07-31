import { useState } from "react";
import "../assets/css/page.css";
import "../assets/css/dashboard.css";

import {
    restoreOfficeMonitoring,
    restoreWarehouseMonitoring,
    restoreEntireSystem,
    silenceAlarm,
} from "../services/api";

type ActionKey = "office" | "warehouse" | "all" | "silence";

interface ActionResult {
    success: boolean;
    message: string;
}

const actions: {
    key: ActionKey;
    title: string;
    description: string;
    icon: string;
    run: () => Promise<{ success: boolean; message: string }>;
}[] = [
    {
        key: "office",
        title: "Restore Office Monitoring",
        description: "Resets Office Area (ESP32A) sensors and clears any active attack/alarm state.",
        icon: "bi-building",
        run: restoreOfficeMonitoring,
    },
    {
        key: "warehouse",
        title: "Restore Warehouse Monitoring",
        description: "Resets Warehouse Area (ESP32B) sensors and clears any active attack/alarm state.",
        icon: "bi-box-seam",
        run: restoreWarehouseMonitoring,
    },
    {
        key: "all",
        title: "Restore Entire System",
        description: "Resets both Office and Warehouse monitoring back to normal condition.",
        icon: "bi-arrow-repeat",
        run: restoreEntireSystem,
    },
    {
        key: "silence",
        title: "Silence Alarm",
        description: "Immediately turns off all active buzzers and alarms in both areas.",
        icon: "bi-bell-slash",
        run: silenceAlarm,
    },
];

export default function EmergencyControl() {
    const [loading, setLoading] = useState<ActionKey | null>(null);
    const [results, setResults] = useState<Partial<Record<ActionKey, ActionResult>>>({});

    const handleAction = async (action: typeof actions[number]) => {
        setLoading(action.key);
        setResults((prev) => ({ ...prev, [action.key]: undefined }));

        try {
            const res = await action.run();
            setResults((prev) => ({
                ...prev,
                [action.key]: {
                    success: res?.success !== false,
                    message: res?.message || "Command sent.",
                },
            }));
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as { message: unknown }).message)
                    : "Failed to send command.";
            setResults((prev) => ({
                ...prev,
                [action.key]: { success: false, message },
            }));
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Emergency Control</h2>
                    <p>Manually restore monitoring or silence alarms across WareSafe zones.</p>
                </div>
            </div>

            <div
                className="alert alert-warning d-flex align-items-center gap-2 mb-4"
                role="alert"
            >
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>
                    These actions publish real MQTT commands directly to the ESP32 devices.
                    Use only when necessary.
                </div>
            </div>

            <div className="row">
                {actions.map((action) => {
                    const result = results[action.key];
                    const isLoading = loading === action.key;

                    return (
                        <div className="col-lg-6 mb-4" key={action.key}>
                            <div className="dashboard-card h-100">
                                <div className="d-flex align-items-start justify-content-between mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className={`bi ${action.icon} fs-4`}></i>
                                        <div className="dashboard-card-title mb-0">
                                            {action.title}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted mb-3">{action.description}</p>

                                <button
                                    className="btn btn-danger"
                                    disabled={isLoading}
                                    onClick={() => handleAction(action)}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Sending…
                                        </>
                                    ) : (
                                        "Execute"
                                    )}
                                </button>

                                {result && (
                                    <div
                                        className={`mt-3 status-badge ${
                                            result.success ? "status-success" : "status-danger"
                                        }`}
                                        style={{ display: "inline-block" }}
                                    >
                                        {result.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
