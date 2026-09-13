import { useState } from "react";
import Zone from "./Zone";
import Device from "./Device";
import Sensor from "./Sensor";
import MqttTopics from "./MqttTopics";

export default function Management() {
    const [tab, setTab] = useState("zone");

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Management</h2>

            <div className="btn-group mb-4">

                <button
                    className={`btn ${tab === "zone" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setTab("zone")}
                >
                    Zone
                </button>

                <button
                    className={`btn ${tab === "device" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setTab("device")}
                >
                    Device
                </button>

                <button
                    className={`btn ${tab === "sensor" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setTab("sensor")}
                >
                    Sensor
                </button>

                <button
                    className={`btn ${tab === "mqtt" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setTab("mqtt")}
                >
                    MQTT Topics
                </button>

            </div>

            {tab === "zone" && <Zone />}
            {tab === "device" && <Device />}
            {tab === "sensor" && <Sensor />}
            {tab === "mqtt" && <MqttTopics />}
        </div>
    );
}