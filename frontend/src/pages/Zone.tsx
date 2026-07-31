import { useCallback, useEffect, useState } from "react";
import "../assets/css/page.css";

import InfoCard from "../components/InfoCard";
import { getZones } from "../services/api";

interface ZoneInfo {
    zone_id: number;
    zone_name: string;
    description: string;
    device_count: number;
    sensor_count: number;
}

export default function Zone() {
    const [zones, setZones] = useState<ZoneInfo[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const data = await getZones();
            if (Array.isArray(data)) setZones(data);
        } catch {
            // keep whatever was already loaded
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>Zone</h2>
                    <p>Registered monitoring zones.</p>
                </div>
            </div>

            <div className="row">
                {zones.length === 0 ? (
                    <div className="col-12 text-center text-muted py-3">No zones registered yet</div>
                ) : zones.map((zone) => (
                    <div className="col-lg-6 mb-4" key={zone.zone_id}>
                        <InfoCard
                            title={zone.zone_name}
                            subtitle="Security Zone"
                            icon={zone.zone_name === "Warehouse" ? "bi-box-seam" : "bi-building"}
                            badge={
                                <span className="status-badge status-success">
                                    Active
                                </span>
                            }
                        >
                            <div className="info-row">
                                <span>Registered Device</span>
                                <strong>{zone.device_count}</strong>
                            </div>

                            <div className="info-row">
                                <span>Registered Sensors</span>
                                <strong>{zone.sensor_count}</strong>
                            </div>
                        </InfoCard>
                    </div>
                ))}
            </div>
        </>
    );
}
