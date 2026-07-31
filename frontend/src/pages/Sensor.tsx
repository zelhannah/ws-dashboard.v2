import "../assets/css/page.css";


import OfficeMonitor from "../components/OfficeMonitor";
import WarehouseMonitor from "../components/WarehouseMonitor";

export default function Sensor() {
    return (
        <>
            <div className="page-header">

                <div>

                    <h2>Sensor</h2>

                    <p>
                        Monitor all sensors installed in Office and Warehouse.
                    </p>

                </div>

            </div>

            <div className="row">

                <div className="col-lg-6 mb-4">

                    <OfficeMonitor />

                </div>

                <div className="col-lg-6 mb-4">

                    <WarehouseMonitor />

                </div>

            </div>
        </>
    );
}