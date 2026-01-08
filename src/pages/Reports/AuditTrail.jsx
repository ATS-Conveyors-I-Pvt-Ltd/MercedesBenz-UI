import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Download, Search, ChevronDown, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import './AuditTrail.css';

const AuditTrail = () => {
    const { activityLogs, currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);

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
