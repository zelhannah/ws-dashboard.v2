import "../assets/css/page.css";
import "../assets/css/dashboard.css";

interface Module {
    id: string;
    letter: string;
    title: string;
    area: "Office" | "Warehouse";
    icon: string;
    tagline: string;
    body: string;
    targets: string[];
    mitigations: { icon: string; text: string }[];
}

const modules: Module[] = [
    {
        id: "replay",
        letter: "A",
        title: "Replay Attack",
        area: "Office",
        icon: "bi-arrow-repeat",
        tagline: "Old IR motion sensor data is replayed to generate false movement.",
        body: "A Replay Attack happens when an attacker captures valid PIR motion sensor data and replays the same message later. The monitoring system believes movement is occurring inside the office even though no actual motion exists. This can trigger unnecessary security responses and gradually reduce operator trust due to repeated false motion events.",
        targets: ["IR Motion Sensor", "Monitoring System"],
        mitigations: [
            { icon: "bi-clock-history", text: "Timestamp Validation — every sensor message includes its sending time so outdated packets are automatically rejected." },
            { icon: "bi-123", text: "Unique Message ID — each MQTT message contains a unique sequence number to detect duplicated packets." },
            { icon: "bi-camera-video", text: "Cross Verification — compare motion events with CCTV footage or additional sensors before confirming movement." },
            { icon: "bi-shield-lock", text: "Secure MQTT Communication — use authentication and encryption to prevent attackers from capturing valid sensor packets." },
        ],
    },
    {
        id: "spoofing",
        letter: "B",
        title: "Vibration Spoofing Attack",
        area: "Office",
        icon: "bi-activity",
        tagline: "Fake vibration data is injected into the monitoring system.",
        body: "A Vibration Spoofing Attack occurs when attackers inject false vibration readings into the monitoring system. The dashboard believes abnormal vibration or tampering is happening even though the physical sensor detects no real activity. This may interrupt operations and trigger unnecessary inspections.",
        targets: ["Vibration Sensor", "Monitoring System and Dashboard"],
        mitigations: [
            { icon: "bi-intersect", text: "Cross-Sensor Validation — verify vibration alerts using nearby PIR sensors, cameras, or device activity logs." },
            { icon: "bi-shield-check", text: "Secure MQTT Authentication — only trusted devices are allowed to publish sensor data." },
            { icon: "bi-funnel", text: "Threshold Filtering — ignore unrealistic vibration values that exceed normal physical limits." },
            { icon: "bi-graph-up-arrow", text: "Anomaly Detection — detect vibration patterns that occur too frequently or inconsistently." },
        ],
    },
    {
        id: "flooding",
        letter: "C",
        title: "Flooding Attack",
        area: "Warehouse",
        icon: "bi-broadcast",
        tagline: "Continuous fake alerts overwhelm the monitoring system.",
        body: "Flooding Attack continuously sends fake danger alerts into the monitoring system. Buzzers repeatedly activate, the dashboard becomes crowded with notifications, and operators experience alert fatigue, making real emergencies difficult to recognize.",
        targets: ["RFID Authentication", "Access Control System", "Security System"],
        mitigations: [
            { icon: "bi-speedometer2", text: "Rate Limiting — restrict how many alarm messages each device can send within a specific time period." },
            { icon: "bi-filter-circle", text: "Alert Filtering — detect repetitive or suspicious alarm patterns and temporarily block them." },
            { icon: "bi-exclamation-triangle", text: "Severity Prioritization — ensure critical alarms remain visible even during notification flooding." },
            { icon: "bi-diagram-3", text: "Network Monitoring — monitor MQTT traffic to identify abnormal message activity." },
        ],
    },
    {
        id: "suppression",
        letter: "D",
        title: "Security Suppression",
        area: "Warehouse",
        icon: "bi-bell-slash",
        tagline: "Security alarms are disabled while unauthorized access occurs.",
        body: "A Security Suppression attack disables security indicators such as buzzers, LEDs, or warning displays while unauthorized activity is taking place. Although sensors may detect abnormal events, operators continue seeing a normal system status, making the attack difficult to notice.",
        targets: ["RFID Access", "Security Monitoring", "Alarm System"],
        mitigations: [
            { icon: "bi-layers", text: "Redundant Alert System — if one alarm channel fails, dashboard alerts, email, or SMS notifications are still delivered." },
            { icon: "bi-shield-check", text: "Integrity Checking — continuously verify that buzzers, LEDs, and alarm modules have not been tampered with." },
            { icon: "bi-lock", text: "Secure Access Control — only authenticated administrators can modify IoT device behavior." },
            { icon: "bi-file-earmark-text", text: "Continuous Log Monitoring — investigate situations where sensors detect activity but alarms remain inactive." },
        ],
    },
];

const areaColor: Record<string, { bg: string; text: string; light: string; border: string }> = {
    Office: { bg: "#C9184A", text: "#fff", light: "#e3f2fd", border: "#C9184A" },
    Warehouse: { bg: "#C9184A", text: "#fff", light: "#f3e5f5", border: "#C9184A" },
};

export default function Education() {
    const office = modules.filter((m) => m.area === "Office");
    const warehouse = modules.filter((m) => m.area === "Warehouse");

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Mitigation Education</h2>
                    <p>Learn how WareSafe detects and mitigates 4 real-world IoT attack scenarios.</p>
                </div>

                <span
                    className="status-badge status-success"
                    style={{ fontSize: 13, padding: "6px 16px" }}
                >
                    <i className="bi bi-shield-check me-1"></i>
                    4 Modules Active
                </span>
            </div>

            <ZoneBanner
                icon="bi-building"
                title="Office Area — ESP32A"
                sub="Scenario 1 & 2 · IR Sensor · Vibration · Door Reed Switch · Buzzer A"
                color={areaColor.Office}
            />

            <div className="row g-4 mb-5">
                {office.map((m) => <ModuleCard key={m.id} module={m} />)}
            </div>

            <ZoneBanner
                icon="bi-box-seam"
                title="Warehouse Area — ESP32B"
                sub="Scenario 3 & 4 · RFID · Door Reed Switch · LED · Buzzer B · LCD"
                color={areaColor.Warehouse}
            />

            <div className="row g-4">
                {warehouse.map((m) => <ModuleCard key={m.id} module={m} />)}
            </div>
        </>
    );
}

function ZoneBanner({
    icon,
    title,
    sub,
    color,
}: {
    icon: string;
    title: string;
    sub: string;
    color: { bg: string; text: string };
}) {
    return (
        <div
            className="d-flex align-items-center gap-3 mb-3 px-4 py-3 rounded-3"
            style={{
                background: `linear-gradient(135deg, ${color.bg}, ${color.bg}cc)`,
                color: color.text,
                boxShadow: `0 6px 20px ${color.bg}40`,
            }}
        >
            <i className={`bi ${icon}`} style={{ fontSize: 30, opacity: 0.9 }} />
            <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{sub}</div>
            </div>
        </div>
    );
}

function ModuleCard({ module: m }: { module: Module }) {
    const c = areaColor[m.area];

    return (
        <div className="col-lg-6">
            <div
                className="h-100 rounded-4 p-4"
                style={{
                    background: "#fff",
                    boxShadow: "0 6px 20px rgba(0,0,0,.07)",
                    borderTop: `4px solid ${c.border}`,
                    transition: ".25s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,.12)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.07)";
                }}
            >
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                            style={{
                                width: 46,
                                height: 46,
                                background: c.light,
                                color: c.bg,
                                fontWeight: 800,
                                fontSize: 18,
                            }}
                        >
                            {m.letter}
                        </div>

                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#2d2d2d" }}>
                                Module {m.letter} — {m.title}
                            </div>
                            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                                <i className={`bi ${m.icon} me-1`} />
                                {m.tagline}
                            </div>
                        </div>
                    </div>

                    <span
                        className="flex-shrink-0"
                        style={{
                            background: c.light,
                            color: c.bg,
                            padding: "3px 12px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        {m.area}
                    </span>
                </div>

                <div
                    className="rounded-3 p-3 mb-3"
                    style={{ background: "#fafaf8", fontSize: 13.5, lineHeight: 1.7, color: "#444" }}
                >
                    {m.body}
                </div>

                <div className="mb-3">
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.7px",
                            color: "#aaa",
                            marginBottom: 8,
                        }}
                    >
                        Attack Targets
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        {m.targets.map((t) => (
                            <span
                                key={t}
                                style={{
                                    background: "#f1f3f5",
                                    color: "#1578db",
                                    padding: "3px 10px",
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    fontFamily: "monospace",
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: "1px solid #f0f0f0", margin: "16px 0" }} />

                <div>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.7px",
                            color: "#aaa",
                            marginBottom: 10,
                        }}
                    >
                        Mitigation Strategies
                    </div>

                    <div className="d-flex flex-column gap-2">
                        {m.mitigations.map((mit) => (
                            <div
                                key={mit.text}
                                className="d-flex align-items-start gap-2 rounded-3 px-3 py-2"
                                style={{ background: c.light }}
                            >
                                <i
                                    className={`bi ${mit.icon} flex-shrink-0 mt-1`}
                                    style={{ color: c.bg, fontSize: 15 }}
                                />
                                <span style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>
                                    {mit.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}