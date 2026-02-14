import React, { useEffect, useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Management/Management.css';
import { BASE_URL, REPORTS_BASE_URL } from '../../constants';

const STAKEHOLDERS = ['LOGISTICS', 'MAINTENANCE', 'QUALITY', 'PRODUCTION', 'PULL CORD'];

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTimeDisplay = (timeStr) => {
  if (!timeStr || String(timeStr).trim() === '') return '—';
  const s = String(timeStr).trim();
  if (s.length >= 8) return s.substring(0, 8);
  if (s.length >= 5) return s.padEnd(8, ':00');
  return s;
};

const formatStakeholder = (val) => {
  if (!val) return '—';
  return String(val).trim().replace(/[.\s]+$/, '') || '—';
};

const StakeholderReport = () => {
  const [lines, setLines] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [lineId, setLineId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch(`${BASE_URL}/lines`);
        if (res.ok) {
          const json = await res.json();
          setLines(Array.isArray(json) ? json : []);
        }
      } catch (e) {
        console.error('Failed to load lines', e);
      }
    };
    const fetchShifts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/shifts`);
        if (res.ok) {
          const json = await res.json();
          setShifts(Array.isArray(json) ? json : []);
        }
      } catch (e) {
        console.error('Failed to load shifts', e);
      }
    };
    fetchLines();
    fetchShifts();
  }, []);

  const hasFilters = !!(fromDate || toDate || lineId || shiftId);
  const ROWS_WHEN_NO_FILTER = 20;

  useEffect(() => {
    if (!hasFilters) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const body = {
        fromDate: fromDate || null,
        toDate: toDate || null,
        lineId: lineId ? Number(lineId) : null,
        shiftId: shiftId ? Number(shiftId) : null,
      };
      const res = await fetch(`${REPORTS_BASE_URL}/api/breakdownReports/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to load report');
      }
      const json = await res.json();
      const data = json?.data || json;
      setReport({
        alarmCountByStakeholder: data.alarmCountByStakeholder || {},
        totalTimeByStakeholder: data.totalTimeByStakeholder || {},
        reportRows: data.reportRows || [],
      });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load stakeholder report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const body = {
        fromDate: fromDate || null,
        toDate: toDate || null,
        lineId: lineId ? Number(lineId) : null,
        shiftId: shiftId ? Number(shiftId) : null,
      };
      const res = await fetch(`${REPORTS_BASE_URL}/api/breakdownReports/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stakeholder-breakdown-report.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Export failed');
    }
  };

  const filteredRows = useMemo(() => {
    if (!report?.reportRows) return [];
    let rows = selectedStakeholder
      ? report.reportRows.filter((r) => (r.stakeholder || '').toUpperCase() === selectedStakeholder)
      : report.reportRows;
    if (!hasFilters) {
      rows = rows.slice(0, ROWS_WHEN_NO_FILTER);
    }
    return rows;
  }, [report?.reportRows, selectedStakeholder, hasFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, lineId, shiftId, selectedStakeholder, report]);

  const goToPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>STAKEHOLDER REPORT</h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      {error && (
        <div className="management-error" style={{ padding: '8px 16px', margin: '0 16px', background: '#fee', color: '#c00' }}>
          {error}
        </div>
      )}

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
        <div className="filter-group">
          <select className="filter-select" value={lineId} onChange={(e) => setLineId(e.target.value)}>
            <option value="">All Lines</option>
            {lines.map((l) => (
              <option key={l.lineId} value={l.lineId}>
                {l.lineName}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select className="filter-select" value={shiftId} onChange={(e) => setShiftId(e.target.value)}>
            <option value="">All Shifts</option>
            {shifts.map((s) => (
              <option key={s.shiftId} value={s.shiftId}>
                {s.shiftName}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="search-btn" onClick={fetchReport} disabled={loading} title="Search">
          <Search size={16} />
        </button>
        <button type="button" className="stakeholder-export-btn stakeholder-export-btn-inline" onClick={handleExport}>
          <Download size={14} />
          Export To Excel
        </button>
      </div>

      {report && (
        <>
          <div className="stakeholder-summary-section">
            <div className="stakeholder-summary-tables">
              <table className="management-table stakeholder-summary-table stakeholder-summary-table-horizontal">
                <thead>
                  <tr>
                    <th></th>
                    {STAKEHOLDERS.map((sh) => (
                      <th
                        key={sh}
                        role="button"
                        tabIndex={0}
                        className={selectedStakeholder === sh ? 'selected' : ''}
                        onClick={() => setSelectedStakeholder(selectedStakeholder === sh ? null : sh)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedStakeholder(selectedStakeholder === sh ? null : sh)}
                      >
                        {sh}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Count of Alarms</th>
                    {STAKEHOLDERS.map((sh) => (
                      <td key={sh}>{report.alarmCountByStakeholder?.[sh] ?? 0}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>Total Time (min)</th>
                    {STAKEHOLDERS.map((sh) => (
                      <td key={sh}>{report.totalTimeByStakeholder?.[sh] ?? 0}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="stakeholder-table-section">
            <h3 className="stakeholder-table-title">Stakeholder Summary Report</h3>
            <div className="stakeholder-table-scroll">
              <div className="table-wrapper">
                {loading ? (
                  <p style={{ padding: '24px', textAlign: 'center' }}>Loading...</p>
                ) : (
                  <table className="management-table stakeholder-table">
                    <thead>
                      <tr>
                        <th className="col-id">#</th>
                        <th className="col-station-name">STATION NAME</th>
                        <th className="col-line-name">LINE NAME</th>
                        <th className="col-stakeholder">STAKEHOLDER</th>
                        <th className="col-breakdown-date">BREAKDOWN DATE</th>
                        <th className="col-resume-date">RESUME DATE</th>
                        <th className="col-from-time">FROM TIME (HH:MM:SS)</th>
                        <th className="col-to-time">TO TIME (HH:MM:SS)</th>
                        <th className="col-duration">DURATION (Min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="col-empty" style={{ textAlign: 'center', padding: '24px' }}>
                            No data found. Use filters and click Search.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((row, index) => (
                          <tr key={(page - 1) * pageSize + index}>
                            <td className="col-id">{(page - 1) * pageSize + index + 1}</td>
                            <td className="col-station-name">{row.station ?? '—'}</td>
                            <td className="col-line-name">{row.lineName ?? '—'}</td>
                            <td className="col-stakeholder">{formatStakeholder(row.stakeholder)}</td>
                            <td className="col-breakdown-date">{formatDateDisplay(row.breakdownDate)}</td>
                            <td className="col-resume-date">{formatDateDisplay(row.breakdownDate)}</td>
                            <td className="col-from-time">{formatTimeDisplay(row.fromTime)}</td>
                            <td className="col-to-time">{formatTimeDisplay(row.toTime)}</td>
                            <td className="col-duration">{row.durationMin != null ? row.durationMin : '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            {!loading && filteredRows.length > 0 && (
              <div className="stakeholder-pagination">
                <div className="pagination-info">
                  Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length}
                </div>
                <div className="pagination-controls">
                  <select
                    className="pagination-select"
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n} per page</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="pagination-page">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!report && (
        <div className="stakeholder-empty-state">
          <p>{loading ? 'Loading...' : 'Use the filters above and click Search to load the Stakeholder Report.'}</p>
        </div>
      )}
    </div>
  );
};

export default StakeholderReport;
