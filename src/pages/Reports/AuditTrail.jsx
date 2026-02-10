import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Download, Search, ChevronDown, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import './AuditTrail.css';

const AuditTrail = () => {
    const { activityLogs, currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);
    const [emailStatus, setEmailStatus] = useState({ configured: false, message: '' });
    const [sendingEmail, setSendingEmail] = useState(false);

    if (currentUser?.role !== 'admin') {
        return (
            <div className="audit-trail-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: '#c53030' }}>Access Denied</h2>
                    <p>You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    // Filter logs based on search
    const filteredLogs = activityLogs.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group logs by User
    const groupedLogs = filteredLogs.reduce((acc, log) => {
        const key = log.userEmail; // Use email as unique key
        if (!acc[key]) {
            acc[key] = {
                userName: log.userName,
                userEmail: log.userEmail,
                lastActive: log.timestamp,
                logs: []
            };
        }
        acc[key].logs.push(log);
        // Keep track of latest timestamp
        if (new Date(log.timestamp) > new Date(acc[key].lastActive)) {
            acc[key].lastActive = log.timestamp;
        }
        return acc;
    }, {});

    const userList = Object.values(groupedLogs).sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

    const toggleRow = (email) => {
        setExpandedUser(expandedUser === email ? null : email);
    };

    const getFormattedTimestamp = () => {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        // Note: Using dashes instead of colons for filename compatibility across all operating systems
        return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredLogs.map(log => ({
            id: log.id,
            'User Name': log.userName,
            'User Email': log.userEmail,
            'Action': log.action,
            'Details': log.details,
            'Timestamp': new Date(log.timestamp).toLocaleString()
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Trail");
        const timestamp = getFormattedTimestamp();
        XLSX.writeFile(workbook, `All_Audit_Trail_Logs_${timestamp}.xlsx`);
    };

    const exportUserLogs = (e, user) => {
        e.stopPropagation(); // Prevent row toggle
        const worksheet = XLSX.utils.json_to_sheet(user.logs.map(log => ({
            id: log.id,
            'User Name': log.userName,
            'User Email': log.userEmail,
            'Action': log.action,
            'Details': log.details,
            'Timestamp': new Date(log.timestamp).toLocaleString()
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Logs");
        const safeName = user.userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = getFormattedTimestamp();
        XLSX.writeFile(workbook, `Audit_Logs_${safeName}_${timestamp}.xlsx`);
    };

    // Check email service status on component mount
    React.useEffect(() => {
        checkEmailStatus();
    }, []);

    const checkEmailStatus = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/test-email');
            const data = await response.json();
            setEmailStatus({
                configured: data.success,
                message: data.success ? 'Email service is active' : data.message
            });
        } catch (error) {
            setEmailStatus({
                configured: false,
                message: 'Unable to connect to server'
            });
        }
    };

    const sendDailyReport = async () => {
        setSendingEmail(true);
        try {
            const stats = {
                totalActivities: activityLogs.length,
                uniqueUsers: new Set(activityLogs.map(l => l.userId)).size,
                loginCount: activityLogs.filter(l => l.action === 'Login').length
            };

            const response = await fetch('http://localhost:3001/api/send-daily-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs: activityLogs, stats })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Daily report sent successfully!');
            } else {
                alert(`⚠️ ${data.message || 'Failed to send report'}`);
            }
        } catch (error) {
            alert('❌ Error sending daily report: ' + error.message);
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className="audit-trail-container">
            <div className="audit-header">
                <h2>User Activity Audit Trail</h2>
                <div className="audit-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search user, action..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="export-btn" onClick={exportToExcel}>
                        <Download size={16} /> Download All Audit Trail
                    </button>
                </div>
            </div>

            {/* Email Notification Controls */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                            📧 Email Notification Service
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: emailStatus.configured ? '#48bb78' : '#f56565',
                                boxShadow: emailStatus.configured ? '0 0 8px #48bb78' : '0 0 8px #f56565',
                                animation: 'pulse 2s infinite'
                            }}></span>
                            <span style={{ color: 'white', fontSize: '14px', opacity: 0.95 }}>
                                {emailStatus.message}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={checkEmailStatus}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                        >
                            🔄 Refresh Status
                        </button>
                        <button
                            onClick={sendDailyReport}
                            disabled={!emailStatus.configured || sendingEmail}
                            style={{
                                background: emailStatus.configured && !sendingEmail ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)',
                                color: emailStatus.configured && !sendingEmail ? '#667eea' : '#999',
                                border: 'none',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                cursor: emailStatus.configured && !sendingEmail ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseOver={(e) => {
                                if (emailStatus.configured && !sendingEmail) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                }
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            {sendingEmail ? '⏳ Sending...' : '📨 Send Daily Report Now'}
                        </button>
                    </div>
                </div>
                {!emailStatus.configured && (
                    <div style={{
                        marginTop: '15px',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>
                            ⚠️ To enable email notifications, please configure your email settings in the <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '3px' }}>.env</code> file.
                            See <strong>EMAIL_SETUP.md</strong> for detailed instructions.
                        </p>
                    </div>
                )}
            </div>

            <div className="table-wrapper">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th className="col-expand"></th>
                            <th className="col-user">User Name</th>
                            <th>Email</th>
                            <th>Total Activities</th>
                            <th>Last Active</th>
                            <th className="col-action">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userList.length > 0 ? (
                            userList.map(user => (
                                <React.Fragment key={user.userEmail}>
                                    <tr onClick={() => toggleRow(user.userEmail)} className={`parent-row ${expandedUser === user.userEmail ? 'expanded' : ''}`} style={{ cursor: 'pointer' }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="learn-more">
                                                <span className="circle" aria-hidden="true">
                                                    <span className="icon arrow"></span>
                                                </span>
                                                <span className="button-text">
                                                    {expandedUser === user.userEmail ? 'Close' : 'View'}
                                                </span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {user.userName ? user.userName.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                {user.userName}
                                            </div>
                                        </td>
                                        <td>{user.userEmail}</td>
                                        <td><span className="count-badge">{user.logs.length}</span></td>
                                        <td>{new Date(user.lastActive).toLocaleString()}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="action-btn-export"
                                                onClick={(e) => exportUserLogs(e, user)}
                                            >
                                                <Download size={12} />
                                                <span>Excel</span>
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedUser === user.userEmail && (
                                        <tr className="detail-row">
                                            <td colSpan="6" style={{ padding: '0', background: '#fafafa' }}>
                                                <div className="detail-content" style={{ padding: '20px' }}>
                                                    <table className="nested-table" style={{ width: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                        <thead style={{ background: '#f0f2f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px 15px', fontSize: '12px' }}>Timestamp</th>
                                                                <th style={{ padding: '10px 15px', fontSize: '12px' }}>Action</th>
                                                                <th style={{ padding: '10px 15px', fontSize: '12px' }}>Details</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {user.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, idx) => (
                                                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                                    <td style={{ padding: '10px 15px', fontSize: '13px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                                                    <td style={{ padding: '10px 15px', fontSize: '13px' }}><span className={`status-badge status-${log.action.toLowerCase().replace(/\s/g, '-')}`}>{log.action}</span></td>
                                                                    <td style={{ padding: '10px 15px', fontSize: '13px', color: '#555' }}>{log.details}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">No activity logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditTrail;
