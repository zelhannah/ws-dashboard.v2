import { useCallback, useEffect, useState } from "react";
import "../assets/css/page.css";
import InfoCard from "../components/InfoCard";
import { getUsers } from "../services/api";

interface Administrator {
    name: string;
    email: string;
    role: string;
    status: string;
}

interface WarehouseAccess {
    name: string;
    email: string;
    card: string;
    role: string;
    status: string;
}

export default function Users() {
    const [administrators, setAdministrators] = useState<Administrator[]>([]);
    const [warehouseStaff, setWarehouseStaff] = useState<WarehouseAccess[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const data = await getUsers();
            if (data?.administrators) setAdministrators(data.administrators);
            if (data?.warehouseAccess) setWarehouseStaff(data.warehouseAccess);
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
                    <h2>Users</h2>
                    <p>Manage system users and RFID access permissions.</p>
                </div>
            </div>

            <InfoCard
                title="User Management"
                subtitle="System Administrators & Warehouse RFID Access"
                icon="bi-people"
            >
                <h5 className="mb-3">System Administrators</h5>

                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "20%" }}>Name</th>
                            <th style={{ width: "28%" }}>Email</th>
                            <th style={{ width: "18%" }}>Role</th>
                            <th style={{ width: "16%" }}>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {administrators.length === 0 ? (
                            <tr><td colSpan={4} className="text-center text-muted py-3">No administrators found</td></tr>
                        ) : administrators.map((user, index) => (
                            <tr key={index}>
                                <td className="fw-semibold">{user.name}</td>
                                <td><small>{user.email}</small></td>
                                <td>
                                    <span
                                        className={`badge ${
                                            user.role === "Admin Company" || user.role === "Admin"
                                                ? "bg-dark"
                                                : user.role === "Office Admin"
                                                ? "bg-primary"
                                                : user.role === "Warehouse Admin"
                                                ? "bg-success"
                                                : "bg-warning text-dark"
                                        }`}
                                        style={{
                                            fontSize: "0.85rem",
                                            padding: "8px 14px",
                                            minWidth: "150px",
                                            display: "inline-block",
                                            textAlign: "center",
                                            borderRadius: "20px",
                                        }}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`badge ${user.status === "Active" ? "bg-success" : "bg-danger"}`}
                                        style={{
                                            fontSize: "0.85rem",
                                            padding: "8px 16px",
                                            minWidth: "90px",
                                            display: "inline-block",
                                            textAlign: "center",
                                            borderRadius: "20px",
                                        }}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr className="my-4" />

                <h5 className="mb-3">Warehouse RFID Access</h5>

                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "20%" }}>Name</th>
                            <th style={{ width: "28%" }}>Email</th>
                            <th style={{ width: "18%" }}>RFID Card</th>
                            <th style={{ width: "18%" }}>Role</th>
                            <th style={{ width: "16%" }}>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {warehouseStaff.length === 0 ? (
                            <tr><td colSpan={5} className="text-center text-muted py-3">No RFID cards issued yet</td></tr>
                        ) : warehouseStaff.map((user, index) => (
                            <tr key={index}>
                                <td className="fw-semibold">{user.name}</td>
                                <td><small>{user.email}</small></td>
                                <td
                                    style={{
                                        fontFamily: "Consolas",
                                        fontWeight: 700,
                                        letterSpacing: "2px",
                                        color: "#d63384",
                                    }}
                                >
                                    {user.card}
                                </td>
                                <td>
                                    <span
                                        className={`badge ${user.role === "Undefined Access" ? "bg-danger" : "bg-secondary"}`}
                                        style={{
                                            fontSize: "0.85rem",
                                            padding: "8px 14px",
                                            minWidth: "150px",
                                            display: "inline-block",
                                            textAlign: "center",
                                            borderRadius: "20px",
                                        }}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`badge ${user.status === "Active" ? "bg-success" : "bg-danger"}`}
                                        style={{
                                            fontSize: "0.85rem",
                                            padding: "8px 16px",
                                            minWidth: "90px",
                                            display: "inline-block",
                                            textAlign: "center",
                                            borderRadius: "20px",
                                        }}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </InfoCard>
        </>
    );
}
