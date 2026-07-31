import { useCallback, useEffect, useState } from "react";
import "../assets/css/page.css";

import DeviceCard from "../components/DeviceCard";
import { getDevices } from "../services/api";

interface DeviceInfo {
    name: string;
    zone: string;
    status: string;
    sensorCount: number;
    lastSeen: string;
    sensors: string[];
}

export default function Device() {
    const [devices, setDevices] = useState<DeviceInfo[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const data = await getDevices();
            if (Array.isArray(data)) setDevices(data);
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
                    <h2>Device</h2>
                    <p>Manage all registered monitoring devices.</p>
                </div>
            </div>

            <div className="row">
                {devices.length === 0 ? (
                    <div className="col-12 text-center text-muted py-3">No devices registered yet</div>
                ) : devices.map((device, index) => (
                    <div className="col-lg-6 mb-4" key={index}>
                        <DeviceCard
                            name={device.name}
                            zone={device.zone}
                            status={device.status}
                            sensorCount={device.sensorCount}
                            lastSeen={device.lastSeen}
                            sensors={device.sensors}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
