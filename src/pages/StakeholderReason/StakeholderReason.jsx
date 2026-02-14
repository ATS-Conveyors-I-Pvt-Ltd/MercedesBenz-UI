import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import './StakeholderReason.css';

const StakeholderReason = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedLine, setSelectedLine] = useState('All Lines');
    const [selectedShift, setSelectedShift] = useState('All Shifts');
    const [lines, setLines] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 50;

    const shifts = ['SHIFT 1', 'SHIFT 2', 'SHIFT 3'];
    const requiredStakeholders = ["LOGISTICS", "MAINTENANCE", "QUALITY", "PRODUCTION", "PULL CORD"];

    useEffect(() => {
        fetchLines();
        handleSearch();
    }, []);

    const fetchLines = async () => {
        try {
            const res = await fetch('http://localhost:8909/api/lines');
            if (res.ok) {
                const data = await res.json();
                setLines(data || []);
            }
        } catch (e) {
            console.error("Failed to fetch lines", e);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        setCurrentPage(1);
        try {
            const response = await fetch('/api/breakdownReasonReports/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromDate: fromDate || null,
                    toDate: toDate || null,
                    line: selectedLine === 'All Lines' ? null : selectedLine,
                    shift: selectedShift === 'All Shifts' ? null : selectedShift
                })
            });
            const result = await response.json();
            if (result.success && result.data && result.data.length > 0) {
                setReportData(result.data[0]);
            } else {
                setReportData(null);
            }
        } catch (error) {
            console.error("Search Error:", error);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch('/api/breakdownReasonReports/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromDate: fromDate || null,
                    toDate: toDate || null,
                    line: selectedLine === 'All Lines' ? null : selectedLine,
                    shift: selectedShift === 'All Shifts' ? null : selectedShift,
                    reportType: 'reason'
                })
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Stakeholder_Reason_Report.xlsx`;
            a.click();
        } catch (error) {
            console.error("Export Error:", error);
        }
    };

    // Pagination Logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = reportData?.reportRows?.slice(indexOfFirstRecord, indexOfLastRecord) || [];
    const totalPages = Math.ceil((reportData?.reportRows?.length || 0) / recordsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="stakeholder-reason-page minimal">
            <header className="report-header-minimal">
                <div className="header-top">
                    <h1 className="main-title">STAKEHOLDER REASON REPORT</h1>
                    <span className="brand-name">Mercedes-Benz India</span>
                </div>

                <div className="filter-bar-minimal">
                    <div className="filter-inputs">
                        <div className="filter-item">
                            <label>From Date</label>
                            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div className="filter-item">
                            <label>To Date</label>
                            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                        <div className="filter-item">
                            <label>Line</label>
                            <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
                                <option>All Lines</option>
                                {lines.map(l => <option key={l.lineId} value={l.lineName}>{l.lineName}</option>)}
                            </select>
                        </div>
                        <div className="filter-item">
                            <label>Shift</label>
                            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}>
                                <option>All Shifts</option>
                                {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button className="search-btn-minimal" onClick={handleSearch} disabled={loading}>
                            <Search size={18} />
                            <span>SEARCH</span>
                        </button>
                    </div>
                    <button className="export-btn-minimal" onClick={handleExport}>
                        <Download size={16} />
                        <span>EXPORT EXCEL</span>
                    </button>
                </div>
            </header>

            <div className="dashboard-summary-cards">
                <div className="summary-card gold-border">
                    <div className="card-header">Count of Alarms per Stakeholder</div>
                    <div className="card-values">
                        {requiredStakeholders.map(s => (
                            <div className="value-item" key={s}>
                                <span className="value-label">{s}</span>
                                <span className="value-num">{reportData?.alarmCountByStakeholder?.[s] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="summary-card blue-border">
                    <div className="card-header">Total Time per Stakeholder (min)</div>
                    <div className="card-values">
                        {requiredStakeholders.map(s => (
                            <div className="value-item" key={s}>
                                <span className="value-label">{s}</span>
                                <span className="value-num">{reportData?.totalTimeByStakeholder?.[s] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="report-main-content">
                <div className="table-header-row">
                    <h3 className="section-title">Breakdown Reason Summary</h3>
                    {reportData?.reportRows?.length > 0 && (
                        <div className="pagination-info">
                            Showing {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, reportData.reportRows.length)} of {reportData.reportRows.length}
                        </div>
                    )}
                </div>

                <div className="modern-table-container">
                    <table className="aesthetic-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>STATION NAME</th>
                                <th>LINE NAME</th>
                                <th>STAKEHOLDER</th>
                                <th>BREAKDOWN DATE</th>
                                <th>RESUME DATE</th>
                                <th>FROM TIME</th>
                                <th>TO TIME</th>
                                <th>DURATION(min)</th>
                                <th>REASON</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" className="td-status-minimal">Fetching reason data...</td></tr>
                            ) : currentRecords.length > 0 ? (
                                currentRecords.map((row, index) => (
                                    <tr key={index}>
                                        <td className="center">{indexOfFirstRecord + index + 1}</td>
                                        <td className="center">{row.station}</td>
                                        <td className="center">{row.lineName}</td>
                                        <td className="center">
                                            <span className={`stakeholder-badge ${row.stakeholder?.toLowerCase().replace(' ', '-')}`}>
                                                {row.stakeholder}
                                            </span>
                                        </td>
                                        <td className="center">{row.breakdownDate}</td>
                                        <td className="center">{row.resumeDate || row.breakdownDate}</td>
                                        <td className="center">{row.fromTime}</td>
                                        <td className="center">{row.toTime}</td>
                                        <td className="center font-bold">{row.durationMin}</td>
                                        <td className="reason-text">{row.reason}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="10" className="td-status-minimal">No reason records found for current selection</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => paginate(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => paginate(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            <footer className="footer-minimal">
                <div className="footer-content">
                    <div className="brand">
                        <span className="logo">iPROD</span>
                        <span className="separator">|</span>
                        <span className="tagline">ENTERPRISE PLATFORM</span>
                    </div>
                    <div className="copyright">© 2026 Mercedes-Benz India. All rights reserved.</div>
                    <div className="timestamp">{new Date().toLocaleString()}</div>
                </div>
            </footer>
        </div>
    );
};

export default StakeholderReason;
