import { useCallback, useEffect, useState } from "react";
import "../assets/css/page.css";
import { getAlerts } from "../services/api";

interface NormalEvent {
    time: string;
    zone: string;
    sensor: string;
    activity: string;
    status: string;
}

interface AttackScenario {
    time: string;
    scenario: string;
    attack: string;
    result: string;
    severity: "Warning" | "Critical";
}

interface AlertLogItem {
    time: string;
    action: string;
    response: string;
    status: string;
}

function severityClass(level: string) {
    switch (level) {
        case "Critical":
            return "status-danger";
        case "Warning":
            return "status-warning";
        default:
            return "status-success";
    }
}

export default function SecurityEvent() {
    const [normalEvents, setNormalEvents] = useState<NormalEvent[]>([]);
    const [attackScenarios, setAttackScenarios] = useState<AttackScenario[]>([]);
    const [alertLog, setAlertLog] = useState<AlertLogItem[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const data = await getAlerts();
            if (data?.normalActivity) setNormalEvents(data.normalActivity);
            if (data?.attackScenarios) setAttackScenarios(data.attackScenarios);
            if (data?.alertLog) setAlertLog(data.alertLog);
        } catch {
            
        }
    }, []);

    useEffect(() => {
        void fetchData();
        const interval = setInterval(() => { void fetchData(); }, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return (
        <>
            {/* NORMAL */}
            <div className="dashboard-card">
                <div className="dashboard-card-title">
                    Normal Sensor Activity
                </div>

                <table className="security-event-table w-100">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Zone</th>
                            <th>Sensor</th>
                            <th>Activity</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {normalEvents.length === 0 ? (
                            <tr><td colSpan={5} className="text-center text-muted py-3">No normal activity yet</td></tr>
                        ) : normalEvents.map((item) => (
                            <tr key={`${item.time}-${item.zone}-${item.sensor}-${item.activity}-${item.status}`}>
                                <td>{item.time}</td>
                                <td>{item.zone}</td>
                                <td>{item.sensor}</td>
                                <td>{item.activity}</td>
                                <td>
                                    <span className="status-badge status-success">
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CYBER */}
            <div className="dashboard-card mt-4">
                <div className="dashboard-card-title">
                    Cyber Attack Scenarios
                </div>

                <table className="security-event-table w-100">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Scenario</th>
                            <th>Attack</th>
                            <th>Impact</th>
                            <th>Severity</th>
                        </tr>
                    </thead>

                    <tbody>
                        {attackScenarios.length === 0 ? (
                            <tr><td colSpan={5} className="text-center text-muted py-3">No attack scenarios recorded yet</td></tr>
                        ) : attackScenarios.map((item) => (
                            <tr key={`${item.time}-${item.scenario}-${item.attack}-${item.result}-${item.severity}`}>
                                <td>{item.time}</td>
                                <td>{item.scenario}</td>
                                <td>{item.attack}</td>
                                <td>{item.result}</td>
                                <td>
                                    <span
                                        className={`status-badge ${severityClass(item.severity)}`}
                                    >
                                        {item.severity}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* previously Defense Activity */}
            <div className="dashboard-card mt-4">
                <div className="dashboard-card-title">
                    Alert Log
                </div>

                <table className="security-event-table w-100">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Alert</th>
                            <th>Details</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {alertLog.length === 0 ? (
                            <tr><td colSpan={4} className="text-center text-muted py-3">No alerts logged yet</td></tr>
                        ) : alertLog.map((item) => (
                            <tr key={`${item.time}-${item.action}-${item.response}-${item.status}`}>
                                <td>{item.time}</td>
                                <td>{item.action}</td>
                                <td>{item.response}</td>
                                <td>
                                    <span className="status-badge status-success">
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
