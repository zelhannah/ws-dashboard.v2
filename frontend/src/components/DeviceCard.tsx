import InfoCard from "./InfoCard";

interface DeviceCardProps {
    name: string;
    zone: string;
    status: string;
    sensorCount: number;
    lastSeen: string;
    sensors: string[];
}

export default function DeviceCard({
    name,
    zone,
    status,
    sensorCount,
    lastSeen,
    sensors,
}: DeviceCardProps) {
    return (
        <InfoCard
            title={name}
            subtitle={zone}
            icon="bi-cpu"
            badge={
                <span
                    className={`status-badge ${
                        status === "Online"
                            ? "status-success"
                            : "status-danger"
                    }`}
                >
                    {status}
                </span>
            }
        >
            <div className="info-row">
                <span>Registered Sensors</span>
                <strong>{sensorCount}</strong>
            </div>

            <div className="info-row">
                <span>Last Seen</span>
                <strong>{lastSeen}</strong>
            </div>

            <hr />

            <div>
                <strong>Installed Sensors</strong>

                <ul className="sensor-list mt-2">

                    {sensors.map((sensor) => (

                        <li key={sensor}>{sensor}</li>

                    ))}

                </ul>
            </div>
        </InfoCard>
    );
}