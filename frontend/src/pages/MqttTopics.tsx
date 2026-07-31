export default function MqttTopics() {

    const officeTopics = [
        "office/floor1/system",
        "office/floor1/security",
        "office/floor1/attack",
        "office/floor1/IRsensor",
        "office/floor1/maindoor",
        "office/floor1/vibration",
        "office/floor1/buzzerA",
        "office/floor1/reedA",
    ];

    const warehouseTopics = [
        "warehouse/floor2/system",
        "warehouse/floor2/security",
        "warehouse/floor2/attack",
        "warehouse/floor2/RFIDaccess",
        "warehouse/floor2/alarm",
        "warehouse/floor2/reedB",
        "warehouse/floor2/buzzerB",
        "warehouse/floor2/warehousedoor",
        "warehouse/floor2/displaytext",
        "warehouse/floor2/ledlight",
    ];

    return (
        <div className="row">

            <div className="col-lg-6">

                <div className="card shadow-sm border-0">

                    <div
                        className="card-header text-white"
                        style={{ backgroundColor: "#d81b60" }}
                    >
                        Office Area MQTT Topics
                    </div>

                    <div className="card-body">

                        <table className="table table-hover align-middle">

                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Topic</th>
                                </tr>
                            </thead>

                            <tbody>
                                {officeTopics.map((topic, index) => (
                                    <tr key={topic}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <code>{topic}</code>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

            <div className="col-lg-6">

                <div className="card shadow-sm border-0">

                    <div
                        className="card-header text-white"
                        style={{ backgroundColor: "#d81b60" }}
                    >
                        Warehouse Area MQTT Topics
                    </div>

                    <div className="card-body">

                        <table className="table table-hover align-middle">

                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Topic</th>
                                </tr>
                            </thead>

                            <tbody>
                                {warehouseTopics.map((topic, index) => (
                                    <tr key={topic}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <code>{topic}</code>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
}