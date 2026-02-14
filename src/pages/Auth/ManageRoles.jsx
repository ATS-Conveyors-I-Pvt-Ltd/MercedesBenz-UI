import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import "./AccessMatrix.css";

export default function ManageRoles() {
    const {
        roles,
        users,
        currentUser,
        SERVICES,
        addRole,
        updateRole,
        deleteRole,
    } = useAuth();
    const navigate = useNavigate();
    const [filterSearch, setFilterSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [modalData, setModalData] = useState({
        name: "",
        permissions: {},
    });

    if (currentUser?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    const filteredRoles = roles.filter((r) => {
        if (!filterSearch) return true;
        const q = filterSearch.toLowerCase();
        return (r.name || "").toLowerCase().includes(q);
    });

    const openAddModal = () => {
        setModalMode("add");
        setModalData({
            name: "",
            permissions: Object.fromEntries(SERVICES.map((s) => [s, false])),
        });
        setShowModal(true);
    };

    const openEditModal = (role) => {
        setModalMode("edit");
        setModalData({
            id: role.id,
            name: role.name,
            permissions: { ...(role.permissions || Object.fromEntries(SERVICES.map((s) => [s, false]))) },
        });
        setShowModal(true);
    };

    const handleModalSave = () => {
        if (!modalData.name?.trim()) {
            alert("Role name is required.");
            return;
        }
        if (modalMode === "add") {
            addRole(modalData);
        } else {
            updateRole(modalData.id, modalData);
        }
        setShowModal(false);
    };

    const handleDelete = (role) => {
        if (["admin", "user"].includes(role.id)) {
            alert("Cannot delete system roles (Admin, User).");
            return;
        }
        if (!confirm(`Delete role "${role.name}"?`)) return;
        try {
            deleteRole(role.id);
        } catch (e) {
            alert(e.message);
        }
    };

    const toggleModalPermission = (service) => {
        setModalData((prev) => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [service]: !prev.permissions?.[service],
            },
        }));
    };

    const downloadCSV = (data, filename) => {
        if (!data.length) {
            alert("No data to export");
            return;
        }
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row) =>
            Object.values(row)
                .map((v) => `"${v}"`)
                .join(",")
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        const data = filteredRoles.map((r) => ({
            Role: r.name,
            ...Object.fromEntries(SERVICES.map((s) => [s, r.permissions?.[s] ? "Yes" : "No"])),
        }));
        downloadCSV(data, `roles_${new Date().toISOString().split("T")[0]}.csv`);
    };

    return (
        <div className="access-matrix-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Roles</h1>
                    <div className="page-subtitle">Define roles and their default permissions</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-outline" onClick={() => navigate("/auth/users")}>
                        Manage Users
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate("/auth/access-matrix")}>
                        Access Matrix
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="content-grid">
                <div className="card" style={{ gridColumn: "1 / -1" }}>
                    <div className="card-header">
                        <div className="card-title">Registered Roles</div>
                        <div className="card-actions">
                            {currentUser?.role === "admin" && (
                                <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                                    + Add Role
                                </button>
                            )}
                            <button className="btn btn-outline btn-sm" onClick={handleExport}>
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="filters-toolbar">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search roles..."
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                        />
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "20%" }}>Role Name</th>
                                    <th style={{ width: "50%" }}>Permissions</th>
                                    <th style={{ width: "15%" }}>Users</th>
                                    {currentUser?.role === "admin" && <th style={{ width: "15%" }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "var(--text-secondary)" }}>
                                            No roles found. Add a role to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRoles.map((r) => (
                                        <tr key={r.id}>
                                            <td>
                                                <span className="badge badge-role" style={{ textTransform: "none" }}>
                                                    {r.name}
                                                </span>
                                                {["admin", "user"].includes(r.id) && (
                                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px" }}>
                                                        (system)
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="perm-dots">
                                                    {SERVICES.map((s) => (
                                                        <div
                                                            key={s}
                                                            className={`perm-dot ${r.permissions?.[s] ? "active" : ""}`}
                                                            title={`${s}: ${r.permissions?.[s] ? "Yes" : "No"}`}
                                                        />
                                                    ))}
                                                    <span style={{ fontSize: "12px", marginLeft: "8px", color: "var(--text-secondary)" }}>
                                                        {SERVICES.filter((s) => r.permissions?.[s]).join(", ") || "None"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {users.filter((u) => (u.role || "").toLowerCase() === (r.name || "").toLowerCase() || u.role === r.id).length}
                                            </td>
                                            {currentUser?.role === "admin" && (
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon btn-ghost"
                                                            onClick={() => openEditModal(r)}
                                                            title="Edit Role"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {!["admin", "user"].includes(r.id) && (
                                                            <button
                                                                className="btn-icon btn-ghost"
                                                                onClick={() => handleDelete(r)}
                                                                title="Delete Role"
                                                                style={{ color: "var(--danger-text)" }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content premium-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrapper">
                                <div className="modal-icon-bg">{modalMode === "add" ? "👤" : "✏️"}</div>
                                <div>
                                    <div className="modal-title">{modalMode === "add" ? "Add New Role" : "Edit Role"}</div>
                                    <div className="modal-subtitle">
                                        {modalMode === "add"
                                            ? "Create a new role with default permissions"
                                            : "Modify role permissions"}
                                    </div>
                                </div>
                            </div>
                            <button className="btn-close-icon" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">
                                        Role Name <span className="required">*</span>
                                    </label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="e.g. Manager, Operator"
                                        value={modalData.name}
                                        onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                                        disabled={modalMode === "edit" && ["admin", "user"].includes(modalData.id)}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Permissions</label>
                                    <div className="perm-list" style={{ marginTop: "8px" }}>
                                        {SERVICES.map((s) => (
                                            <div key={s} className="perm-item">
                                                <span className="perm-name">{s}</span>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!modalData.permissions?.[s]}
                                                        onChange={() => toggleModalPermission(s)}
                                                    />
                                                    <span className="slider" />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary btn-lg" onClick={handleModalSave}>
                                {modalMode === "add" ? "Create Role" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
