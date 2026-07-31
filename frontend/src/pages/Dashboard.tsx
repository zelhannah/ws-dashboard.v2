import "../assets/css/dashboard.css";
import { useEffect, useState, useCallback } from "react";
import { getDashboardSummary, getDashboardOverview, getOfficeSensors, getWarehouseSensors } from "../services/api";

// ── Types ────────────────────────────────────────────────────────────────────
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

interface SensorRow {
    topic: string;
    label: string;
    payload: string;
    time: string;
}

interface HourlyData {
    hour: string;
    count: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
    NORMAL: "#198754",
    WARNING: "#d48806",
    DANGER: "#dc3545",
};

const badgeClass: Record<string, string> = {
    red: "badge-red",
    orange: "badge-orange",
    yellow: "badge-yellow",
    green: "badge-green",
    purple: "badge-purple",
};

// ── Fallback values ──────────────────────────────────────────────────────
// Minimal defaults — hanya angka statis, tidak ada data palsu.
// Tabel dan list tetap kosong sampai API selesai.

const defaultSummary = { zone: 0, device: 0, sensor: 0, alert: 0 } as DashboardSummary;

const defaultOfficeStatus = { status: "NORMAL" as const, sensors: 0, activeAlerts: 0, description: "" } as AreaStatus;

const defaultWarehouseStatus = { status: "NORMAL" as const, sensors: 0, activeAlerts: 0, description: "" } as AreaStatus;

const defaultLatestAlerts: Alert[] = [];

const defaultRecentActivity: ActivityItem[] = [];

const defaultOfficeSensors: SensorRow[] = [];

const defaultWarehouseSensors: SensorRow[] = [];

const defaultHourlyData: HourlyData[] = [];

// ── Component ────────────────────────────────────────────────────────────────
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
    const [hourlyData, setHourlyData] = useState<HourlyData[]>(defaultHourlyData);

    const fetchAll = useCallback(async () => {
        try {
            const [summaryRes, overviewRes, officeRes, warehouseRes] = await Promise.all([
                getDashboardSummary(),
                getDashboardOverview(),
                getOfficeSensors(),
                getWarehouseSensors(),
            ]);

            if (summaryRes) setSummary(summaryRes);

            if (overviewRes) {
                if (overviewRes.hourlyData?.length) setHourlyData(overviewRes.hourlyData);
                if (overviewRes.latestAlerts) setLatestAlerts(overviewRes.latestAlerts);
                if (overviewRes.recentActivity) setRecentActivity(overviewRes.recentActivity);
                if (overviewRes.officeStatus) setOfficeStatus(overviewRes.officeStatus);
                if (overviewRes.warehouseStatus) setWarehouseStatus(overviewRes.warehouseStatus);
            }

            if (Array.isArray(officeRes) && officeRes.length) {
                setOfficeSensors(
                    officeRes.map((s: { label: string; value: string; timestamp: string }) => ({
                        topic: s.label,
                        label: s.label,
                        payload: s.value,
                        time: new Date(s.timestamp).toLocaleTimeString(),
                    }))
                );
            }

            if (Array.isArray(warehouseRes) && warehouseRes.length) {
                setWarehouseSensors(
                    warehouseRes.map((s: { label: string; value: string; timestamp: string }) => ({
                        topic: s.label,
                        label: s.label,
                        payload: s.value,
                        time: new Date(s.timestamp).toLocaleTimeString(),
                    }))
                );
            }
        } catch {
            // keep whatever was already on screen (defaults or last good fetch)
        }
    }, []);

    useEffect(() => {
        void fetchAll();
        const interval = setInterval(() => { void fetchAll(); }, 10000);
        return () => clearInterval(interval);
    }, [fetchAll]);

    const quickCounts = {
        normal: [...officeSensors, ...warehouseSensors].filter((s) => getPayloadClass(s.payload) === "payload-success").length,
        warning: [...officeSensors, ...warehouseSensors].filter((s) => getPayloadClass(s.payload) === "payload-warning" || getPayloadClass(s.payload) === "payload-danger").length,
        offline: [...officeSensors, ...warehouseSensors].filter((s) => getPayloadClass(s.payload) === "payload-secondary").length,
        scenarios: latestAlerts.filter((a) => a.badgeColor === "purple").length,
    };

    // ── Chart rendering ──────────────────────────────────────────────────────
    const maxCount = Math.max(...hourlyData.map((h) => h.count), 1);
    const chartHeight = 160;
    const chartWidth = 560;
    const padL = 40;
    const padB = 32;
    const plotW = chartWidth - padL - 16;
    const plotH = chartHeight - padB;

    const points =
        hourlyData.length > 1
            ? hourlyData
                  .map((d, i) => {
                      const x = padL + (i / (hourlyData.length - 1)) * plotW;
                      const y = plotH - (d.count / maxCount) * (plotH - 10);
                      return `${x},${y}`;
                  })
                  .join(" ")
            : "";

    const areaPoints =
        hourlyData.length > 1
            ? `${padL},${plotH} ${points} ${padL + plotW},${plotH}`
            : "";

    if (summary.zone === 0 && summary.sensor === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <p className="text-muted">Loading dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ── Header ── */}
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

            {/* ── Top Stat Cards ── */}
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
                            <div className="stat-value" style={{ color: "#198754" }}>
                                ACTIVE
                            </div>
                            <div className="stat-label">System Status</div>
                            <div className="stat-sub">All systems operational</div>
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

            {/* ── Chart + Latest Alerts ── */}
            <div className="row g-3 mb-4">
                <div className="col-lg-7">
                    <div className="db-card h-100">
                        <div className="db-card-title">Realtime Security Activity</div>
                        {hourlyData.length > 1 ? (
                            <svg
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                style={{ width: "100%", height: "auto" }}
                            >
                                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => {
                                    const y = plotH - v * (plotH - 10);
                                    return (
                                        <g key={i}>
                                            <line
                                                x1={padL} x2={padL + plotW}
                                                y1={y} y2={y}
                                                stroke="#f0f0f0" strokeWidth={1}
                                            />
                                            <text
                                                x={padL - 6} y={y + 4}
                                                fontSize={9} fill="#aaa" textAnchor="end"
                                            >
                                                {Math.round(v * maxCount)}
                                            </text>
                                        </g>
                                    );
                                })}
                                <polygon points={areaPoints} fill="rgba(216,27,96,0.08)" />
                                <polyline
                                    points={points} fill="none"
                                    stroke="#d81b60" strokeWidth={2.5} strokeLinejoin="round"
                                />
                                {hourlyData.map((d, i) => {
                                    const x = padL + (i / (hourlyData.length - 1)) * plotW;
                                    const y = plotH - (d.count / maxCount) * (plotH - 10);
                                    return <circle key={i} cx={x} cy={y} r={3.5} fill="#d81b60" />;
                                })}
                                {hourlyData.map((d, i) => {
                                    const x = padL + (i / (hourlyData.length - 1)) * plotW;
                                    return (
                                        <text
                                            key={i} x={x} y={chartHeight - 4}
                                            fontSize={9} fill="#aaa" textAnchor="middle"
                                        >
                                            {d.hour}:00
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

            {/* ── Area Status Cards ── */}
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

            {/* ── Device Status + Recent Activity + Quick Overview ── */}
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
                                <tr>
                                    <td><strong>ESP32A</strong></td>
                                    <td>Office (Area A)</td>
                                    <td><span className="status-badge status-success">ONLINE</span></td>
                                    <td className="text-secondary small">10:22:15</td>
                                </tr>
                                <tr>
                                    <td><strong>ESP32B</strong></td>
                                    <td>Warehouse (Area B)</td>
                                    <td><span className="status-badge status-success">ONLINE</span></td>
                                    <td className="text-secondary small">01:27:25</td>
                                </tr>
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
                            <a href="/activity-record" className="link-primary small">View All</a>
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

            {/* ── Latest Sensor Readings ── */}
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
                                {officeSensors.map((s, i) => (
                                    <tr key={i}>
                                        <td><code className="topic-code">{s.label}</code></td>
                                        <td>
                                            <span className={`payload-badge ${getPayloadClass(s.payload)}`}>
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
                                {warehouseSensors.map((s, i) => (
                                    <tr key={i}>
                                        <td><code className="topic-code">{s.label}</code></td>
                                        <td>
                                            <span className={`payload-badge ${getPayloadClass(s.payload)}`}>
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function getPayloadClass(payload: string): string {
    const p = payload.toUpperCase();
    if (
        p.includes("ATTACK") ||
        p.includes("DANGER") ||
        p.includes("ALARM") ||
        p.includes("UNAUTHORIZED") ||
        p.includes("ABNORMAL") ||
        p.includes("FORCED")
    )
        return "payload-danger";
    if (
        p.includes("WARNING") ||
        p.includes("MOTION") ||
        p.includes("OPEN") ||
        p.includes("SCENARIO") ||
        p.includes("SPOOFED") ||
        p.includes("REPLAY") ||
        p.includes("CONTINUOUS") ||
        p.includes("DEFENSE")
    )
        return "payload-warning";
    if (
        p.includes("NORMAL") ||
        p.includes("SAFE") ||
        p.includes("ONLINE") ||
        p.includes("CLOSED") ||
        p.includes("LOCKED") ||
        p.includes("BLOCKED") ||
        p.includes("OFF") ||
        p.includes("WON") ||
        p.includes("ACTIVE")
    )
        return "payload-success";
    return "payload-secondary";
}