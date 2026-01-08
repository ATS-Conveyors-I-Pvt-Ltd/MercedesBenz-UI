import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
// Mock removed. Real context used.
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
// Assuming react-icons is installed. If not, we might need to use lucide-react which is already in the project.
import { Edit2, Settings, Check, X, Eye } from 'lucide-react';
// Replaced React Icons with Lucide React for consistency with current project

import "./AccessMatrix.css";

export default function AccessMatrix() {
    const {
        users,
        currentUser,
        activityLogs,
        sessionLogs,
        globalLogs,
        logout,
        updateUserStatus,
        togglePermission,
        setAllPermissions,
        addUser,
        updateUser,
        deleteUser,
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
    const PAGE_SIZE = 10; // Increased page size for better table view

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [modalData, setModalData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'pending',
        remarks: '',
        permissions: {}
    });

    // Pagination
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

    // Log View State
    const [logView, setLogView] = useState('timeline');

    // Approval History State
    const [approvalHistory, setApprovalHistory] = useState([]);

    // User Activity Modal State
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityUserId, setActivityUserId] = useState(null);

    // Get real user activity logs from globalLogs
    // Get real user activity logs from globalLogs using context activityLogs
    const getUserActivityLogs = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return [];
        return activityLogs.filter(log => log.userEmail === user.email || log.userId === userId || log.userName === user.name).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    // Calculate recent updates (last 24h)
    const recentUpdates = activityLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        return (now - logTime) < 24 * 60 * 60 * 1000; // 24 hours
    }).length;

    // Modal Handlers
    const openAddModal = () => {
        setModalMode('add');
        setModalData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            status: 'pending',
            remarks: '',
            permissions: Object.fromEntries(SERVICES.map(s => [s, false]))
        });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setModalData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password, // Keep existing password or handle separately
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

    const toggleModalPermission = (service) => {
        setModalData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [service]: !prev.permissions?.[service]
            }
        }));
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

    const handleExportLogs = () => {
        const data = activityLogs.map(log => ({
            Timestamp: new Date(log.timestamp).toLocaleString(),
            User: log.userName,
            Email: log.userEmail,
            Action: log.action,
            Details: log.details
        }));
        downloadCSV(data, `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
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

    // Analytics Data Calculation
    const analyticsData = useMemo(() => {
        if (!activityLogs || activityLogs.length === 0) {
            return { screenTimeData: [], activeTimers: [], mostUsed: { name: 'N/A', count: 0 } };
        }

        const today = new Date().toISOString().split('T')[0];
        const userSessions = {};
        const navCounts = {};

        activityLogs.forEach(log => {
            // Safety check for log format
            if (!log || typeof log !== 'object') return;

            const logDate = log.timestamp.split('T')[0];
            if (logDate === today) {
                // Screen Time & Active Timers logic (Simplified estimate based on First/Last log)
                if (!userSessions[log.userEmail]) {
                    userSessions[log.userEmail] = { start: log.timestamp, end: log.timestamp, name: log.userName };
                } else {
                    if (log.timestamp < userSessions[log.userEmail].start) userSessions[log.userEmail].start = log.timestamp;
                    if (log.timestamp > userSessions[log.userEmail].end) userSessions[log.userEmail].end = log.timestamp;
                }

                // Most Used Action (renamed from Nav)
                if (log.action) {
                    navCounts[log.action] = (navCounts[log.action] || 0) + 1;
                }
            }
        });

        // Process Screen Time
        const screenTimeData = Object.values(userSessions).map(session => {
            const start = new Date(session.start);
            const end = new Date(session.end);
            // Min 1 minute if only 1 log
            let diffMinutes = Math.round((end - start) / 1000 / 60);
            if (diffMinutes === 0) diffMinutes = 1;

            return { name: session.name, minutes: diffMinutes };
        }).sort((a, b) => b.minutes - a.minutes).slice(0, 5);

        // Process Active Timers (Just showing session duration basically)
        const activeTimers = Object.values(userSessions).map(session => {
            const start = new Date(session.start);
            const end = new Date(session.end);
            const diffMs = end - start;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return { name: session.name, time: `${hours}h ${minutes}m` };
        });

        // Process Most Used
        let mostUsed = { name: 'N/A', count: 0 };
        Object.entries(navCounts).forEach(([name, count]) => {
            if (count > mostUsed.count) {
                mostUsed = { name, count };
            }
        });

        return { screenTimeData, activeTimers, mostUsed };
    }, [activityLogs, users]);

    return (
        <div className="access-matrix-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Access Matrix</h1>
                    <div className="page-subtitle">Manage user permissions and system access</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </button>
                    <button className="btn btn-outline" onClick={logout}>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{users.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending Requests</div>
                    <div className="stat-value" style={{ color: '#d97706' }}>
                        {users.filter(u => u.status === 'pending').length}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Recent Activity (24h)</div>
                    <div className="stat-value" style={{ color: '#2563eb' }}>
                        {recentUpdates}
                    </div>
                </div>
            </div>

            {/* Analytics Row */}
            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {/* Card 1: Highest Screen Time */}
                <div className="card" style={{ padding: '16px', minHeight: '250px' }}>
                    <div className="card-title" style={{ marginBottom: '12px' }}>Highest Screen Time (Today)</div>
                    <div style={{ height: '200px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={analyticsData.screenTimeData}>
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                                <YAxis hide />
                                <RechartsTooltip />
                                <Bar dataKey="minutes" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                    {analyticsData.screenTimeData.map((entry, index) => (
                                        <Cell key={`cell - ${index} `} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Card 2: Active User Timers */}
                <div className="card" style={{ padding: '16px', minHeight: '250px' }}>
                    <div className="card-title" style={{ marginBottom: '12px' }}>Active Session Duration</div>
                    <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
                        {analyticsData.activeTimers.length === 0 ? (
                            <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>No active users today</div>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {analyticsData.activeTimers.map((u, i) => (
                                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                                        <span style={{ fontFamily: 'monospace', color: '#2563eb' }}>{u.time}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Card 3: Most Used Element */}
                <div className="card" style={{ padding: '16px', minHeight: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card-title" style={{ width: '100%', marginBottom: '12px' }}>Most Used Navigation</div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🧭</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
                            {analyticsData.mostUsed.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Visited {analyticsData.mostUsed.count} times
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="content-grid">
                {/* Left Column: User Table */}
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

                                                {/* Activity Log */}
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

                {/* Right Column: Sidebar */}
                <div className="sidebar-section">
                    {/* Permissions Panel */}
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

                    {/* Activity Log */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Session Activity</div>
                            <button className="btn btn-ghost btn-sm" onClick={handleExportLogs}>Export</button>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '0 16px' }}>
                            <ul className="timeline">
                                {activityLogs.slice(0, 10).map((entry, i) => (
                                    <li key={i} className="timeline-item">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-text">
                                                {entry.action} <span style={{ color: 'var(--text-secondary)' }}>- {entry.details}</span>
                                            </div>
                                            <div className="timeline-time">
                                                {new Date(entry.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit User Modal - Premium UI */}
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
                                        <select className="form-select" value={modalData.role} onChange={e => setModalData({ ...modalData, role: e.target.value })}>
                                            <option value="admin">Admin (Full Access)</option>
                                            <option value="user">User (Restricted)</option>
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

            {/* User Activity Modal */}
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
