import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Edit2, Check, X, Eye, Settings } from 'lucide-react';
import "./AccessMatrix.css";

export default function ManageUsers() {
    const {
        users,
        roles,
        currentUser,
        activityLogs,
        updateUserStatus,
        togglePermission,
        setAllPermissions,
        addUser,
        updateUser,
        clearUserActivity,
        SERVICES
    } = useAuth();
    const navigate = useNavigate();
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterSearch, setFilterSearch] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const selectedUser = users.find(u => u.id === selectedUserId) || null;
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [modalData, setModalData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'pending',
        remarks: '',
        permissions: {}
    });

    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityUserId, setActivityUserId] = useState(null);

    const filteredUsers = users.filter(u => {
        if (filterRole && u.role !== filterRole) return false;
        if (filterStatus && u.status !== filterStatus) return false;
        if (!filterSearch) return true;
        const q = filterSearch.toLowerCase();
        return (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.role || "").toLowerCase().includes(q);
    });

    const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
    const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const initials = (name = "") => name.split(" ").filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase();

    const getUserActivityLogs = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return [];
        return activityLogs.filter(log => log.userEmail === user.email || log.userId === userId || log.userName === user.name)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    const openAddModal = () => {
        setModalMode('add');
        const defaultRole = roles.find(r => r.id === 'user' || r.name?.toLowerCase() === 'user');
        const defaultPerms = defaultRole?.permissions ?? Object.fromEntries(SERVICES.map(s => [s, false]));
        setModalData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            status: 'pending',
            remarks: '',
            permissions: { ...defaultPerms }
        });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setModalData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            status: user.status,
            remarks: user.remarks || '',
            permissions: user.permissions || Object.fromEntries(SERVICES.map(s => [s, false]))
        });
        setShowModal(true);
    };

    const handleModalSave = () => {
        if (!modalData.email || (modalMode === 'add' && !modalData.password)) {
            alert("Email and Password are required for new users.");
            return;
        }
        if (modalMode === 'add') {
            addUser(modalData);
        } else {
            updateUser(modalData.id, modalData);
        }
        setShowModal(false);
    };

    const downloadCSV = (data, filename) => {
        if (!data.length) {
            alert("No data to export");
            return;
        }
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(","));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportActivity = () => {
        const data = users.map(u => ({
            ID: u.id,
            Name: u.name,
            Email: u.email,
            Role: u.role,
            Status: u.status,
            RequestedAt: u.requestedAt || "N/A",
            LastLogin: u.lastLogin || "Never",
            PermissionsCount: Object.values(u.permissions || {}).filter(Boolean).length
        }));
        downloadCSV(data, `user_list_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportUserActivity = (userId) => {
        const user = users.find(u => u.id === userId);
        const logs = getUserActivityLogs(userId);
        const data = logs.map(log => ({
            Timestamp: new Date(log.timestamp).toLocaleString(),
            Action: log.action,
            User: log.userName,
            Details: log.details
        }));
        downloadCSV(data, `activity_log_${user?.email}_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const openActivityModal = (userId) => {
        setActivityUserId(userId);
        setShowActivityModal(true);
    };

    const handleClearLogs = () => {
        if (confirm("Are you sure you want to clear all activity logs for this user?")) {
            clearUserActivity(users.find(u => u.id === activityUserId)?.email);
        }
    };

    return (
        <div className="access-matrix-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Users</h1>
                    <div className="page-subtitle">Registered users and account management</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" onClick={() => navigate('/auth/access-matrix')}>
                        Access Matrix
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="content-grid">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Registered Users</div>
                        <div className="card-actions">
                            {currentUser?.role === 'admin' && (
                                <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                                    + Add User
                                </button>
                            )}
                            <button className="btn btn-outline btn-sm" onClick={handleExportActivity}>
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="filters-toolbar">
                        <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search users..."
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                        />
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Permissions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">{initials(u.name || u.email)}</div>
                                                <div className="user-info">
                                                    <div className="user-name">{u.name}</div>
                                                    <div className="user-email">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-role">{u.role}</span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-status-${u.status}`}>
                                                {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="perm-dots">
                                                {SERVICES.slice(0, 5).map(s => (
                                                    <div
                                                        key={s}
                                                        className={`perm-dot ${u.permissions?.[s] ? 'active' : ''}`}
                                                        title={s}
                                                    ></div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {currentUser?.role === 'admin' && u.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn-icon btn-success"
                                                            onClick={() => updateUserStatus(u.id, 'approved')}
                                                            title="Approve User"
                                                        >
                                                            <Check />
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-danger"
                                                            onClick={() => updateUserStatus(u.id, 'rejected')}
                                                            title="Reject User"
                                                        >
                                                            <X />
                                                        </button>
                                                    </>
                                                )}
                                                {currentUser?.role === 'admin' && (
                                                    <button
                                                        className="btn-icon btn-ghost"
                                                        onClick={() => openActivityModal(u.id)}
                                                        title="View Activity Log"
                                                    >
                                                        <Eye />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-icon btn-ghost"
                                                    onClick={() => setSelectedUserId(u.id)}
                                                    title="Manage Permissions"
                                                >
                                                    <Settings />
                                                </button>
                                                {currentUser?.role === "admin" && (
                                                    <button
                                                        className="btn-icon btn-ghost"
                                                        onClick={() => openEditModal(u)}
                                                        title="Edit User"
                                                    >
                                                        <Edit2 />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <div className="pagination-info">
                            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users
                        </div>
                        <div className="pagination-controls">
                            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                Previous
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Permissions</div>
                            {selectedUser && <span className="badge badge-role">{selectedUser.name}</span>}
                        </div>
                        {!selectedUser ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                Select a user from the table to manage their permissions.
                            </div>
                        ) : (
                            <div className="perm-list">
                                <div className="perm-item" style={{ background: '#f1f5f9' }}>
                                    <span className="perm-name" style={{ fontWeight: 600 }}>Grant All Access</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={SERVICES.every(s => selectedUser.permissions?.[s])}
                                            onChange={() => currentUser?.role === 'admin' && setAllPermissions(selectedUser.id, !SERVICES.every(s => selectedUser.permissions?.[s]))}
                                            disabled={currentUser?.role !== 'admin'}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                {SERVICES.map(s => (
                                    <div key={s} className="perm-item">
                                        <span className="perm-name">{s}</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedUser.permissions?.[s]}
                                                onChange={() => currentUser?.role === 'admin' && togglePermission(selectedUser.id, s)}
                                                disabled={currentUser?.role !== 'admin'}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                ))}
                                {selectedUser.status === 'pending' && currentUser?.role === 'admin' && (
                                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '10px' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1, backgroundColor: '#10b981', borderColor: '#10b981' }}
                                            onClick={() => updateUserStatus(selectedUser.id, 'approved')}
                                        >
                                            Approve User
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ flex: 1, color: '#ef4444', borderColor: '#ef4444' }}
                                            onClick={() => updateUserStatus(selectedUser.id, 'rejected')}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content premium-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrapper">
                                <div className="modal-icon-bg">
                                    {modalMode === 'add' ? '👤' : '✏️'}
                                </div>
                                <div>
                                    <div className="modal-title">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</div>
                                    <div className="modal-subtitle">{modalMode === 'add' ? 'Create a new account for system access' : 'Modify existing user details'}</div>
                                </div>
                            </div>
                            <button className="btn-close-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Full Name <span className="required">*</span></label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={modalData.name}
                                        onChange={e => setModalData({ ...modalData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address <span className="required">*</span></label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        placeholder="john@company.com"
                                        value={modalData.email}
                                        onChange={e => setModalData({ ...modalData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password {modalMode === 'add' && <span className="required">*</span>}</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder={modalMode === 'add' ? "Set a strong password" : "Leave blank to keep current"}
                                        value={modalData.password}
                                        onChange={e => setModalData({ ...modalData, password: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <div className="select-wrapper">
                                        <select
                                            className="form-select"
                                            value={modalData.role}
                                            onChange={e => {
                                                const roleId = e.target.value;
                                                const role = roles.find(r => r.id === roleId || r.name?.toLowerCase() === roleId);
                                                setModalData({
                                                    ...modalData,
                                                    role: roleId,
                                                    permissions: role?.permissions ?? Object.fromEntries(SERVICES.map(s => [s, false]))
                                                });
                                            }}
                                        >
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Account Status</label>
                                    <div className="select-wrapper">
                                        <select className="form-select" value={modalData.status} onChange={e => setModalData({ ...modalData, status: e.target.value })}>
                                            <option value="pending">⏳ Pending Approval</option>
                                            <option value="approved">✅ Active / Approved</option>
                                            <option value="rejected">🚫 Rejected / Blocked</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Remarks / Notes</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Optional notes about this user..."
                                        value={modalData.remarks}
                                        onChange={e => setModalData({ ...modalData, remarks: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary btn-lg" onClick={handleModalSave}>
                                {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showActivityModal && activityUserId && (
                <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                Activity Log: {users.find(u => u.id === activityUserId)?.name}
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowActivityModal(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                                        <th style={{ padding: '8px' }}>Time</th>
                                        <th style={{ padding: '8px' }}>Action</th>
                                        <th style={{ padding: '8px' }}>User</th>
                                        <th style={{ padding: '8px' }}>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getUserActivityLogs(activityUserId).length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                No activity recorded for this user.
                                            </td>
                                        </tr>
                                    ) : (
                                        getUserActivityLogs(activityUserId).map((log, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{log.action}</span>
                                                </td>
                                                <td style={{ padding: '8px' }}>{log.userName}</td>
                                                <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{log.details}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                            <button className="btn btn-outline" onClick={() => handleExportUserActivity(activityUserId)}>
                                ⬇ Download Report (CSV)
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleClearLogs}>
                                    Clear Logs
                                </button>
                                <button className="btn btn-primary" onClick={() => setShowActivityModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
