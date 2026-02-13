import React, { useState } from 'react';
import { Edit, Download, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import '../Management/Management.css';

const StakeholderReason = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Mock data for Stakeholder Reasons
    const data = [
        { id: 1, reason: 'Material Shortage', stakeholder: 'Logistics', date: '2025-12-16' },
        { id: 2, reason: 'Machine Breakdown', stakeholder: 'Maintenance', date: '2025-12-16' },
        { id: 3, reason: 'Quality Issue', stakeholder: 'Quality', date: '2025-12-16' },
        { id: 4, reason: 'Manpower Shortage', stakeholder: 'HR', date: '2025-12-17' },
        { id: 5, reason: 'Power Failure', stakeholder: 'Utility', date: '2025-12-17' },
        { id: 6, reason: 'Software Glitch', stakeholder: 'IT', date: '2025-12-18' },
        { id: 7, reason: 'Training', stakeholder: 'Production', date: '2025-12-18' },
        { id: 8, reason: 'Audit', stakeholder: 'Quality', date: '2025-12-19' },
    ];

    const handleExport = () => {
        const header = ['ID', 'Reason', 'Stakeholder', 'Date'];
        const body = data.map(row => [row.id, row.reason, row.stakeholder, row.date]);

        const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stakeholder Reasons");

        XLSX.writeFile(wb, "Stakeholder_Reasons.xlsx");
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <div className="header-title-section">
                    <h2>MANAGE STAKEHOLDER REASON</h2>
                </div>
                <div className="header-brand">Mercedes-Benz India</div>
            </div>

            {/* Filter Bar */}
            <div className="management-filters">
                <div className="filter-group">
                    <span className="filter-label">From Date</span>
                    <input
                        type="date"
                        className="filter-input"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <span className="filter-label">To Date</span>
                    <input
                        type="date"
                        className="filter-input"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>

                <button className="search-btn" title="Search">
                    <Search size={16} />
                </button>

                <button className="submit-btn-top" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={14} />
                    EXPORT TO EXCEL
                </button>
            </div>

            <div className="management-content">
                <div className="table-wrapper">
                    <table className="management-table">
                        <thead>
                            <tr>
                                <th className="col-id">#</th>
                                <th>REASON</th>
                                <th>STAKEHOLDER</th>
                                <th>DATE</th>
                                <th className="col-action">CPANEL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}>
                                    <td className="col-id">{row.id}</td>
                                    <td>{row.reason}</td>
                                    <td>{row.stakeholder}</td>
                                    <td>{row.date}</td>
                                    <td className="col-action">
                                        <div className="action-btn-group">
                                            <button className="action-btn edit">
                                                <Edit className="action-icon" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StakeholderReason;
