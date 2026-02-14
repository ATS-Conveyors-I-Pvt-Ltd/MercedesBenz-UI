import React, { useEffect, useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './Breakdown.css';
import './Management.css';

import { BASE_URL } from '../../constants';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  const s = String(timeStr).trim();
  if (s.length >= 8) return s.substring(0, 8);
  return s;
};

const BreakdownManagement = () => {
  const [breakdowns, setBreakdowns] = useState([]);
  const [lines, setLines] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [lineId, setLineId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch(`${BASE_URL}/lines`);
        if (res.ok) {
          const data = await res.json();
          setLines(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to load lines', e);
      }
    };
    const fetchShifts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/shifts`);
        if (res.ok) {
          const data = await res.json();
          setShifts(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to load shifts', e);
      }
    };
    fetchLines();
    fetchShifts();
  }, []);

  const fetchBreakdowns = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);
      if (lineId) params.set('lineId', lineId);
      if (shiftId) params.set('shiftId', shiftId);
      const res = await fetch(`${BASE_URL}/breakdown-details?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load breakdown details');
      const data = await res.json();
      setBreakdowns(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setBreakdowns([]);
      setError(e.message || 'Failed to load breakdown details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(breakdowns.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return breakdowns.slice(start, start + pageSize);
  }, [breakdowns, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, lineId, shiftId, breakdowns.length]);

  const goToPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE BREAKDOWN DETAILS</h2>
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
          <span className="filter-label">Line</span>
          <select
            className="filter-select"
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
          >
            <option value="">All Lines</option>
            {lines.map((l) => (
              <option key={l.lineId} value={l.lineId}>
                {l.lineName}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Shift</span>
          <select
            className="filter-select"
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
          >
            <option value="">All Shifts</option>
            {shifts.map((s) => (
              <option key={s.shiftId} value={s.shiftId}>
                {s.shiftName}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="search-btn" onClick={fetchBreakdowns} disabled={loading}>
          <Search size={16} />
        </button>
      </div>

      <div className="management-content breakdown-management-content">
        <div className="table-wrapper breakdown-table-wrapper">
          {loading ? (
            <p style={{ padding: '24px', textAlign: 'center' }}>Loading...</p>
          ) : (
            <table className="management-table breakdown-table">
              <thead>
                <tr>
                  <th className="col-id">#</th>
                  <th className="col-line">LINE NAME</th>
                  <th className="col-station">STATION NAME</th>
                  <th className="col-name">NAME</th>
                  <th className="col-shift">SHIFT NAME</th>
                  <th className="col-date">START DATE</th>
                  <th className="col-time text-right">START TIME</th>
                  <th className="col-date">RESUME DATE</th>
                  <th className="col-time text-right">RESUME TIME</th>
                  <th className="col-comments">SUPERVISOR COMMENTS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="col-empty">
                      No breakdown details found.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, index) => (
                    <tr
                      key={row.breakdownHistoryId}
                      className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                    >
                      <td className="col-id">{(page - 1) * pageSize + index + 1}</td>
                      <td className="col-line">{row.lineName || '—'}</td>
                      <td className="col-station">{row.stationName || '—'}</td>
                      <td className="col-name">{row.breakdownName || '—'}</td>
                      <td className="col-shift">{row.shiftName || '—'}</td>
                      <td className="col-date">{formatDate(row.breakdownDate)}</td>
                      <td className="col-time text-right">{formatTime(row.breakdownTime)}</td>
                      <td className="col-date">{formatDate(row.resumeDate)}</td>
                      <td className="col-time text-right">{formatTime(row.resumeTime)}</td>
                      <td className="col-comments">
                        <input
                          type="text"
                          className="table-input"
                          style={{ minWidth: '200px' }}
                          defaultValue={row.supervisorComments || ''}
                          readOnly
                          placeholder="—"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && breakdowns.length > 0 && (
          <div className="stakeholder-pagination breakdown-management-pagination">
            <div className="pagination-info">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, breakdowns.length)} of {breakdowns.length}
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
    </div>
  );
};

export default BreakdownManagement;
