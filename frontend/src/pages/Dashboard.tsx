import "../assets/css/dashboard.css";
import { useEffect, useState, useCallback, useRef } from "react";
import { getDashboardSummary, getDashboardOverview, getOfficeSensors, getWarehouseSensors, getDevices } from "../services/api";
interface DashboardSummary {
    zone: number;
    device: number;
    sensor: number;
    alert: number;
}

interface AreaStatus {
    status: "NORMAL" | "WARNING" | "DANGER";
    sensors: number;
    activeAlerts: number;
    description: string;
}

interface Alert {
    id: number;
    badge: string;
    badgeColor: string;
    sensor: string;
    area: string;
    time: string;
}

interface ActivityItem {
    id: number;
    dot: string;
    label: string;
    sub: string;
    time: string;
}

type SensorSeverity = "success" | "warning" | "danger" | "secondary" | "off";

interface SensorRow {
    topic: string;
    label: string;
    payload: string;
    status: SensorSeverity;
    time: string;
}

interface SecurityTimelinePoint {
    time: string;
    level: number; // 0 = Normal, 1 = Warning, 2 = Danger
    status: string;
    scenario: string | null;
}

interface DeviceRow {
    name: string;
    zone: string;
    status: "Online" | "Offline";
    lastSeen: string;
}

interface AlertPopup {
    area: "Office" | "Warehouse";
    level: "warning" | "danger";
    sensor: string;
    value: string;
    time: string;
}

const statusColor: Record<string, string> = {
    NORMAL: "#198754",
    WARNING: "#d48806",
    DANGER: "#dc3545",
};

// index 0/1/2 matches SecurityTimelinePoint.level
const levelColor = ["#198754", "#d48806", "#dc3545"];
const levelLabel = ["Normal", "Warning", "Danger"];

const badgeClass: Record<string, string> = {
    red: "badge-red",
    orange: "badge-orange",
    yellow: "badge-yellow",
    green: "badge-green",
    purple: "badge-purple",
};

//  Fallback values 
// Tabel dan list tetap kosong sampai API selesai.

const defaultSummary = { zone: 0, device: 0, sensor: 0, alert: 0 } as DashboardSummary;
const defaultOfficeStatus = { status: "NORMAL" as const, sensors: 0, activeAlerts: 0, description: "" } as AreaStatus;
const defaultWarehouseStatus = { status: "NORMAL" as const, sensors: 0, activeAlerts: 0, description: "" } as AreaStatus;
const defaultLatestAlerts: Alert[] = [];
const defaultRecentActivity: ActivityItem[] = [];
const defaultOfficeSensors: SensorRow[] = [];
const defaultWarehouseSensors: SensorRow[] = [];
const defaultSecurityTimeline: SecurityTimelinePoint[] = [];
const defaultDevices: DeviceRow[] = [];

//  Component 
export default function Dashboard() {
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
    const [officeStatus, setOfficeStatus] = useState<AreaStatus>(defaultOfficeStatus);
    const [warehouseStatus, setWarehouseStatus] = useState<AreaStatus>(defaultWarehouseStatus);
    const [latestAlerts, setLatestAlerts] = useState<Alert[]>(defaultLatestAlerts);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>(defaultRecentActivity);
    const [officeSensors, setOfficeSensors] = useState<SensorRow[]>(defaultOfficeSensors);
    const [warehouseSensors, setWarehouseSensors] = useState<SensorRow[]>(defaultWarehouseSensors);
    const [securityTimeline, setSecurityTimeline] = useState<SecurityTimelinePoint[]>(defaultSecurityTimeline);
    const [devices, setDevices] = useState<DeviceRow[]>(defaultDevices);
    const [alertPopup, setAlertPopup] = useState<AlertPopup | null>(null);

    // Remembers each area's last worst status so the popup fires once, right
    // when a zone *enters* Warning/Danger — not on every 2s poll while it stays there.
    const prevOfficeStatus = useRef<SensorSeverity>("success");
    const prevWarehouseStatus = useRef<SensorSeverity>("success");

    const checkAreaPopup = useCallback(
        (area: "Office" | "Warehouse", rows: SensorRow[], prevRef: { current: SensorSeverity }) => {
            const current = worstStatus(rows);

            // Masuk ke Warning atau Danger (hanya saat levelnya berubah) -> tampilkan/replace popup
            if ((current === "danger" || current === "warning") && current !== prevRef.current) {
                const trigger = rows.find((r) => r.status === current);
                setAlertPopup({
                    area,
                    level: current,
                    sensor: trigger?.label ?? "Unknown sensor",
                    value: trigger?.payload ?? current.toUpperCase(),
                    time: new Date().toLocaleTimeString(),
                });
            }

            // Kembali ke Normal -> popup untuk area ini otomatis hilang, tanpa perlu Accept
            if (current === "success" && prevRef.current !== "success") {
                setAlertPopup((prev) => (prev && prev.area === area ? null : prev));
            }

            prevRef.current = current;
        },
        []
    );

    const fetchAll = useCallback(async () =>  {
        try {
            const [summaryRes, overviewRes, officeRes, warehouseRes, devicesRes] = await Promise.all([
                getDashboardSummary(),
                getDashboardOverview(),
                getOfficeSensors(),
                getWarehouseSensors(),
                getDevices(),
            ]);

            if (summaryRes) setSummary(summaryRes);

            if (overviewRes) {
                if (overviewRes.securityTimeline?.length) setSecurityTimeline(overviewRes.securityTimeline);
                if (overviewRes.latestAlerts) setLatestAlerts(overviewRes.latestAlerts);
                if (overviewRes.recentActivity) setRecentActivity(overviewRes.recentActivity);
                if (overviewRes.officeStatus) setOfficeStatus(overviewRes.officeStatus);
                if (overviewRes.warehouseStatus) setWarehouseStatus(overviewRes.warehouseStatus);
            }

            if (Array.isArray(officeRes) && officeRes.length) {
                const mappedOffice = mapSensorRows(officeRes);
                setOfficeSensors(mappedOffice);
                checkAreaPopup("Office", mappedOffice, prevOfficeStatus);
            }

            if (Array.isArray(warehouseRes) && warehouseRes.length) {
                const mappedWarehouse = mapSensorRows(warehouseRes);
                setWarehouseSensors(mappedWarehouse);
                checkAreaPopup("Warehouse", mappedWarehouse, prevWarehouseStatus);
            }

            if (Array.isArray(devicesRes)) {
                setDevices(
                    devicesRes.map((d: { name: string; zone: string; status: string; lastSeen: string }) => ({
                        name: d.name,
                        zone: d.zone,
                        status: d.status === "Online" ? "Online" : "Offline",
                        lastSeen: d.lastSeen,
                    }))
                );
            }
        } catch {
            
        }
    }, [checkAreaPopup]);

    useEffect(() => {
        void fetchAll();
        const interval = setInterval(() => { void fetchAll(); }, 2000);
        return () => clearInterval(interval);
    }, [fetchAll]);

    const quickCounts = {
        normal: [...officeSensors, ...warehouseSensors].filter((s) => s.status === "success").length,
        warning: [...officeSensors, ...warehouseSensors].filter((s) => s.status === "warning" || s.status === "danger").length,
        offline: devices.filter((d) => d.status === "Offline").length,
        scenarios: new Set(
            latestAlerts
                .filter((a) => a.badgeColor === "purple")
                .map((a) => a.badge.match(/SCENARIO[_\s]?(\d+)/i)?.[1])
                .filter((n): n is string => Boolean(n))
        ).size,
    };

    const onlineDeviceCount = devices.filter((d) => d.status === "Online").length;
    const systemStatus = devices.length > 0 && onlineDeviceCount === devices.length ? "ACTIVE" : "OFFLINE";
    const systemStatusColor = systemStatus === "ACTIVE" ? "#198754" : "#dc3545";
    const systemStatusSub = devices.length === 0
        ? "No device data yet"
        : `${onlineDeviceCount}/${devices.length} devices online`;

    const chartHeight = 160;
    const chartWidth = 560;
    const padL = 46;
    const padT = 14;  
    const padB = 32;
    const plotW = chartWidth - padL - 16;
    const plotH = chartHeight - padB - padT;

    const xForIndex = (i: number) =>
    securityTimeline.length > 1
        ? padL + (i / (securityTimeline.length - 1)) * plotW
        : padL;
    const yForLevel = (level: number) => padT + plotH - (level / 2) * plotH;

    // Garis diagonal lurus antar titik (bukan siku-siku), sesuai referensi.
    const points = securityTimeline
        .map((d, i) => `${xForIndex(i)},${yForLevel(d.level)}`)
        .join(" ");

    const areaPoints =
        securityTimeline.length > 1
            ? `${padL},${plotH} ${points} ${xForIndex(securityTimeline.length - 1)},${plotH}`
            : "";

    if (summary.zone === 0 && summary.sensor === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <div className="text-center">
                    <output className="spinner-border text-primary mb-3" aria-live="polite" />
                    <p className="text-muted">Loading dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {alertPopup && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 2000,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-live="assertive"
                        aria-modal="true"
                        style={{
                            background: "#fff",
                            borderTop: `6px solid ${alertPopup.level === "danger" ? "#dc3545" : "#d48806"}`,
                            borderRadius: 10,
                            boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
                            padding: "28px 32px",
                            minWidth: 340,
                            maxWidth: 420,
                            textAlign: "center",
                        }}
                    >
                        <i
                            className={`bi ${alertPopup.level === "danger" ? "bi-exclamation-octagon-fill" : "bi-exclamation-triangle-fill"}`}
                            style={{
                                color: alertPopup.level === "danger" ? "#dc3545" : "#d48806",
                                fontSize: 42,
                            }}
                        />
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: 18,
                                color: alertPopup.level === "danger" ? "#dc3545" : "#d48806",
                                marginTop: 10,
                            }}
                        >
                            {alertPopup.level === "danger" ? "Danger detected" : "Warning detected"} — {alertPopup.area}
                        </div>
                        <div style={{ fontSize: 15, color: "#333", marginTop: 8 }}>
                            {alertPopup.sensor}: {alertPopup.value}
                        </div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>{alertPopup.time}</div>
                        <button
                            type="button"
                            onClick={() => setAlertPopup(null)}
                            style={{
                                marginTop: 20,
                                background: alertPopup.level === "danger" ? "#dc3545" : "#d48806",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "10px 28px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Accept
                        </button>
                    </div>
                </div>
            )}
            <div className="db-header">
                <div>
                    <h2 className="db-title">Dashboard Overview</h2>
                    <p className="db-subtitle">Real-time overview of WareSafe security system</p>
                </div>
                <div className="db-datetime">
                    <i className="bi bi-clock me-1" />
                    {today}
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-xl col-md-4 col-6">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "#e8f0fe" }}>
                            <i className="bi bi-shield-check" style={{ color: "#1565c0" }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{summary.zone}</div>
                            <div className="stat-label">Total Zones</div>
                            <div className="stat-sub">Office, Warehouse</div>
                        </div>
                    </div>
                </div>
                <div className="col-xl col-md-4 col-6">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "#f3e5f5" }}>
                            <i className="bi bi-cpu" style={{ color: "#7b1fa2" }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{summary.device}</div>
                            <div className="stat-label">Total Devices</div>
                            <div className="stat-sub">ESP32A, ESP32B</div>
                        </div>
                    </div>
                </div>
                <div className="col-xl col-md-4 col-6">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "#e8f8ee" }}>
                            <i className="bi bi-broadcast" style={{ color: "#198754" }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{summary.sensor}</div>
                            <div className="stat-label">Total Sensors</div>
                            <div className="stat-sub">All Active</div>
                        </div>
                    </div>
                </div>
                <div className="col-xl col-md-6 col-6">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "#e8f8ee" }}>
                            <i className="bi bi-heart-pulse" style={{ color: "#198754" }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value" style={{ color: systemStatusColor }}> {systemStatus} </div>
                            <div className="stat-label">System Status</div>
                            <div className="stat-sub">{systemStatusSub}</div>
                        </div>
                    </div>
                </div>
                <div className="col-xl col-md-6 col-6">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "#fdecec" }}>
                            <i className="bi bi-bell" style={{ color: "#dc3545" }} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value" style={{ color: "#dc3545" }}>
                                {summary.alert}
                            </div>
                            <div className="stat-label">Active Alerts</div>
                            <div className="stat-sub">Requires attention</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* chart & latest alerts */}
            <div className="row g-3 mb-4">
                <div className="col-lg-7">
                    <div className="db-card h-100">
                        <div className="db-card-title">Realtime Security Activity</div>
                        {securityTimeline.length > 1 ? (
                            <svg
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                style={{ width: "100%", height: "auto" }}
                            >
                                {[0, 1, 2].map((level) => {
                                    const y = yForLevel(level);
                                    return (
                                        <g key={level}>
                                            <line
                                                x1={padL} x2={padL + plotW}
                                                y1={y} y2={y}
                                                stroke="#f0f0f0" strokeWidth={1}
                                            />
                                            <text
                                                x={padL - 6} y={y + 4}
                                                fontSize={6} fill="#aaa" textAnchor="end"
                                            >
                                                {levelLabel[level]}
                                            </text>
                                        </g>
                                    );
                                })}
                                <polygon points={areaPoints} fill="rgba(216,27,96,0.08)" />
                                <polyline
                                    points={points} fill="none"
                                    stroke="#d81b60" strokeWidth={2.5} strokeLinejoin="round"
                                />
                                {securityTimeline.map((d, i) => {
                                    const x = xForIndex(i);
                                    const y = yForLevel(d.level);
                                    return (
                                        <circle key={`${d.time}-${i}`} cx={x} cy={y} r={d.scenario ? 5 : 2.5} fill={levelColor[d.level]}/>
                                    );
                                })}
                                {securityTimeline.map((d, i) => {
                                    if (!d.scenario) return null;
                                    const x = xForIndex(i);
                                    const y = yForLevel(d.level);
                                    let anchor: "start" | "middle" | "end" = "middle";
                                    if (i === 0) {
                                        anchor = "start";
                                    } else if (i === securityTimeline.length - 1) {
                                        anchor = "end";
                                    }
                                    return (
                                        <text
                                            key={`${d.time}-${i}-scenario`} x={x} y={y - 6}
                                            fontSize={7} fill="#d81b60" fontWeight={600} textAnchor={anchor}
                                        >
                                            {d.scenario}
                                        </text>
                                    );
                                })}
                                {securityTimeline.map((d, i) => {
                                    const n = securityTimeline.length;
                                    const step = Math.max(1, Math.ceil(n / 6));
                                    if (i % step !== 0 && i !== n - 1) return null;
                                    const x = xForIndex(i);
                                    return (
                                        <text
                                            key={`${d.time}-${i}-label`} x={x} y={chartHeight - 4}
                                            fontSize={7.5} fill="#aaa" textAnchor="middle"
                                        >
                                            {d.time.slice(0, 5)}
                                        </text>
                                    );
                                })}
                            </svg>
                        ) : (
                            <div className="chart-empty">
                                <i className="bi bi-activity" />
                                <p>Waiting for activity data…</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="db-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="db-card-title mb-0">Latest Alerts</div>
                            <a href="/alerts" className="link-primary small">View All</a>
                        </div>
                        {latestAlerts.length === 0 ? (
                            <div className="no-data">
                                <i className="bi bi-check-circle text-success" />
                                <p>No active alerts</p>
                            </div>
                        ) : (
                            <div className="alert-list">
                                {latestAlerts.slice(0, 6).map((a) => (
                                    <div key={a.id} className="alert-row">
                                        <span className={`evt-badge ${badgeClass[a.badgeColor] ?? "badge-red"}`}>
                                            {a.badge}
                                        </span>
                                        <span className="alert-sensor">{a.sensor}</span>
                                        <span className="alert-area">{a.area}</span>
                                        <span className="alert-time">{a.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* area status card */}
            <div className="row g-3 mb-4">
                <div className="col-lg-4 col-md-6">
                    <div className="db-card area-status-card">
                        <div className="d-flex align-items-center gap-3">
                            <div className="area-icon" style={{ background: "#e3f2fd" }}>
                                <i className="bi bi-building" style={{ color: "#1565c0" }} />
                            </div>
                            <div>
                                <div className="area-name">Office Area (Area A)</div>
                                <div className="area-status-label" style={{ color: statusColor[officeStatus.status] }}>
                                    {officeStatus.status}
                                </div>
                                <div className="area-desc">{officeStatus.description}</div>
                            </div>
                        </div>
                        <div className="area-counts">
                            <div className="area-count-item">
                                <span>{officeStatus.sensors}</span>
                                <small>Sensors</small>
                            </div>
                            <div className="area-count-item">
                                <span style={{ color: officeStatus.activeAlerts > 0 ? "#dc3545" : "inherit" }}>
                                    {officeStatus.activeAlerts}
                                </span>
                                <small>Active Alerts</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6">
                    <div className="db-card area-status-card">
                        <div className="d-flex align-items-center gap-3">
                            <div className="area-icon" style={{ background: "#f3e5f5" }}>
                                <i className="bi bi-box-seam" style={{ color: "#7b1fa2" }} />
                            </div>
                            <div>
                                <div className="area-name">Warehouse Area (Area B)</div>
                                <div className="area-status-label" style={{ color: statusColor[warehouseStatus.status] }}>
                                    {warehouseStatus.status}
                                </div>
                                <div className="area-desc">{warehouseStatus.description}</div>
                            </div>
                        </div>
                        <div className="area-counts">
                            <div className="area-count-item">
                                <span>{warehouseStatus.sensors}</span>
                                <small>Sensors</small>
                            </div>
                            <div className="area-count-item">
                                <span style={{ color: warehouseStatus.activeAlerts > 0 ? "#dc3545" : "inherit" }}>
                                    {warehouseStatus.activeAlerts}
                                </span>
                                <small>Active Alerts</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-12">
                    <div className="db-card area-status-card">
                        <div className="d-flex align-items-center gap-3">
                            <div className="area-icon" style={{ background: "#e8f8ee" }}>
                                <i className="bi bi-shield-check" style={{ color: "#198754" }} />
                            </div>
                            <div>
                                <div className="area-name">System Health</div>
                                <div className="area-status-label" style={{ color: "#198754" }}>100%</div>
                                <div className="area-desc">Performance</div>
                            </div>
                        </div>
                        <div className="area-counts">
                            <div className="area-count-item">
                                <span>{summary.device}</span>
                                <small>Devices Online</small>
                            </div>
                            <div className="area-count-item">
                                <span>{summary.sensor}</span>
                                <small>Sensors Online</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-4">
                {/* Device Status */}
                <div className="col-lg-4">
                    <div className="db-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="db-card-title mb-0">Device Status</div>
                            <a href="/management" className="link-primary small">View All</a>
                        </div>
                        <table className="device-table">
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>Area</th>
                                    <th>Status</th>
                                    <th>Last Seen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-secondary small text-center">
                                            No device data yet
                                        </td>
                                    </tr>
                                ) : (
                                    devices.map((d) => (
                                        <tr key={`${d.name}-${d.zone}`}>
                                            <td><strong>{d.name}</strong></td>
                                            <td>{d.zone}</td>
                                            <td>
                                                <span className={`status-badge ${d.status === "Online" ? "status-success" : "status-danger"}`}>
                                                    {d.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="text-secondary small">{d.lastSeen}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div className="db-card-title mt-4 mb-3">Sensor Distribution</div>
                        <div className="d-flex align-items-center gap-4">
                            <div className="donut-wrap">
                                <svg viewBox="0 0 80 80" width="80" height="80">
                                    <circle cx="40" cy="40" r="30" fill="none" stroke="#e3f2fd" strokeWidth="14" />
                                    <circle
                                        cx="40" cy="40" r="30" fill="none" stroke="#d81b60" strokeWidth="14"
                                        strokeDasharray={`${(officeStatus.sensors / (officeStatus.sensors + warehouseStatus.sensors)) * 188.5} 188.5`}
                                        strokeDashoffset="47" strokeLinecap="round"
                                    />
                                    <circle
                                        cx="40" cy="40" r="30" fill="none" stroke="#7b1fa2" strokeWidth="14"
                                        strokeDasharray={`${(warehouseStatus.sensors / (officeStatus.sensors + warehouseStatus.sensors)) * 188.5} 188.5`}
                                        strokeDashoffset={`${-(officeStatus.sensors / (officeStatus.sensors + warehouseStatus.sensors)) * 188.5 + 47}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <div className="donut-legend">
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ background: "#d81b60" }} />
                                    <span>Office Area</span>
                                    <strong>{officeStatus.sensors}</strong>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot" style={{ background: "#7b1fa2" }} />
                                    <span>Warehouse Area</span>
                                    <strong>{warehouseStatus.sensors}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-lg-4">
                    <div className="db-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="db-card-title mb-0">Recent Activity</div>
                            <a href="/alerts" className="link-primary small">View All</a>
                        </div>
                        {recentActivity.length === 0 ? (
                            <div className="no-data">
                                <i className="bi bi-activity" />
                                <p>No recent activity</p>
                            </div>
                        ) : (
                            <div className="activity-list">
                                {recentActivity.slice(0, 6).map((a) => (
                                    <div key={a.id} className="activity-item">
                                        <span className="act-dot" style={{ background: a.dot }} />
                                        <div className="act-body">
                                            <div className="act-label">{a.label}</div>
                                            <div className="act-sub">{a.sub}</div>
                                        </div>
                                        <span className="act-time">{a.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Overview */}
                <div className="col-lg-4">
                    <div className="db-card h-100">
                        <div className="db-card-title mb-3">Quick Overview</div>
                        <div className="quick-grid">
                            <div className="quick-item">
                                <div className="quick-label">Zones</div>
                                <div className="quick-value">{summary.zone}</div>
                            </div>
                            <div className="quick-item">
                                <div className="quick-label">Devices</div>
                                <div className="quick-value">{summary.device}</div>
                            </div>
                            <div className="quick-item">
                                <div className="quick-label">Sensors</div>
                                <div className="quick-value">{summary.sensor}</div>
                            </div>
                            <div className="quick-item">
                                <div className="quick-label">Active Alerts</div>
                                <div className="quick-value" style={{ color: "#dc3545" }}>
                                    {summary.alert}
                                </div>
                            </div>
                        </div>

                        <div className="quick-grid mt-3">
                            <div className="quick-item">
                                <div className="quick-label">Normal</div>
                                <div className="quick-value" style={{ color: "#198754" }}>
                                    {quickCounts.normal}
                                </div>
                            </div>
                            <div className="quick-item">
                                <div className="quick-label">Warning</div>
                                <div className="quick-value" style={{ color: "#d48806" }}>
                                    {quickCounts.warning}
                                </div>
                            </div>
                            <div className="quick-item">
                                <div className="quick-label">Offline</div>
                                <div className="quick-value" style={{ color: "#6c757d" }}>
                                    {quickCounts.offline}
                                </div>
                            </div>
                            <div className="quick-item">
                                <div className="quick-label">Scenarios</div>
                                <div className="quick-value" style={{ color: "#7b1fa2" }}>
                                    {quickCounts.scenarios}
                                </div>
                            </div>
                        </div>
                        </div>
                        </div>
                        </div>

            {/* Latest Sensor Readings */}
            <div className="row g-3 mb-4">
                <div className="col-lg-6">
                    <div className="db-card">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-building" style={{ color: "#1565c0", fontSize: 20 }} />
                            <div className="db-card-title mb-0">Latest Office Sensors</div>
                        </div>
                        <table className="sensor-table">
                            <thead>
                                <tr>
                                    <th>Topic</th>
                                    <th>Payload</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {officeSensors.map((s) => (
                                    <tr key={`${s.topic}-${s.time}`}>
                                        <td><code className="topic-code">{s.label}</code></td>
                                        <td>
                                            <span className={`payload-badge ${getPayloadClass(s.status)}`}>
                                                {s.payload}
                                            </span>
                                        </td>
                                        <td className="text-secondary small">{s.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="db-card">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-box-seam" style={{ color: "#7b1fa2", fontSize: 20 }} />
                            <div className="db-card-title mb-0">Latest Warehouse Sensors</div>
                        </div>
                        <table className="sensor-table">
                            <thead>
                                <tr>
                                    <th>Topic</th>
                                    <th>Payload</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouseSensors.map((s) => (
                                    <tr key={`${s.topic}-${s.time}`}>
                                        <td><code className="topic-code">{s.label}</code></td>
                                        <td>
                                            <span className={`payload-badge ${getPayloadClass(s.status)}`}>
                                                {s.payload}
                                            </span>
                                        </td>
                                        <td className="text-secondary small">{s.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

function getPayloadClass(status: SensorSeverity): string {
    return `payload-${status}`;
}

function mapSensorRows(rows: { label: string; value: string; timestamp: string; status: SensorSeverity }[]): SensorRow[] {
    return rows.map((s) => ({
        topic: s.label,
        label: s.label,
        payload: s.value,
        status: s.status,
        time: new Date(s.timestamp).toLocaleTimeString(),
    }));
}

/** Worst status among a list of sensor rows — danger beats warning beats everything else. */
function worstStatus(rows: SensorRow[]): SensorSeverity {
    if (rows.some((r) => r.status === "danger")) return "danger";
    if (rows.some((r) => r.status === "warning")) return "warning";
    return "success";
}