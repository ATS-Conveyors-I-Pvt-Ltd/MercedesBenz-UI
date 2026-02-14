import React, { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
// Mock removed. Real context used.
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
// Assuming react-icons is installed. If not, we might need to use lucide-react which is already in the project.
// Replaced React Icons with Lucide React for consistency with current project

import "./AccessMatrix.css";

export default function AccessMatrix() {
    const { users, currentUser, activityLogs, logout } = useAuth();
    const navigate = useNavigate();

    // Calculate recent updates (last 24h)
    const recentUpdates = activityLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        return (now - logTime) < 24 * 60 * 60 * 1000; // 24 hours
    }).length;

    const downloadCSV = (data, filename) => {
        if (!data.length) return;
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
                    <button className="btn btn-primary" onClick={() => navigate('/auth/users')}>
                        Manage Users
                    </button>
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
                <div className="sidebar-section" style={{ gridColumn: '1 / -1', maxWidth: '600px' }}>
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

        </div>
    );
}
