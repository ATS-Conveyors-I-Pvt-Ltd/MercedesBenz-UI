import React, { useEffect, useState } from 'react';
import { Search, Edit } from 'lucide-react';
import './Breakdown.css';

const API_BASE = 'http://localhost:8909/api';

const formatDateTime = (dateStr, timeStr) => {
  const datePart = dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const t = timeStr != null && timeStr !== '' ? (typeof timeStr === 'string' ? timeStr : String(timeStr)) : '';
  const timePart = t.length >= 8 ? t.substring(0, 8) : t;
  if (!datePart && !timePart) return '';
  return timePart ? `${datePart} ${timePart}` : datePart;
};

const mapApiRowToTableRow = (item) => ({
  id: item.breakdownHistoryId,
  line: item.lineName || '',
  station: item.stationName || '',
  name: item.breakdownName || '',
  shift: item.shiftName || '',
  startDateTime: formatDateTime(item.breakdownDate, item.breakdownTime),
  resumeDateTime: formatDateTime(item.resumeDate, item.resumeTime),
  comments: item.supervisorComments || '',
});

const BreakdownManagement = () => {
  const [data, setData] = useState([]);
  const [lines, setLines] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [lineId, setLineId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editComments, setEditComments] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch(`${API_BASE}/lines`);
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
        const res = await fetch(`${API_BASE}/shifts`);
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

  const fetchBreakdownDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);
      if (lineId) params.set('lineId', lineId);
      if (shiftId) params.set('shiftId', shiftId);
      const res = await fetch(`${API_BASE}/breakdown-details?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load breakdown details');
      const json = await res.json();
      const rows = Array.isArray(json) ? json.map(mapApiRowToTableRow) : [];
      setData(rows);
      setEditingId(null);
      setEditComments('');
    } catch (e) {
      console.error(e);
      setData([]);
      setError(e.message || 'Failed to load breakdown details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdownDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditComments(row.comments || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditComments('');
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    setError(null);
    try {
      const params = new URLSearchParams({ supervisorComments: editComments });
      const res = await fetch(`${API_BASE}/breakdown-details/${editingId}?${params}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to update supervisor comments');
      const updated = await res.json();
      setData((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, comments: updated.supervisorComments || editComments } : r))
      );
      setEditingId(null);
      setEditComments('');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to update supervisor comments');
    } finally {
      setSaving(false);
    }
  };

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
          <select
            className="filter-select"
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
          >
            <option value="">--All Lines--</option>
            {lines.map((l) => (
              <option key={l.lineId} value={l.lineId}>
                {l.lineName}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
          >
            <option value="">--All Shifts--</option>
            {shifts.map((s) => (
              <option key={s.shiftId} value={s.shiftId}>
                {s.shiftName}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="search-btn" onClick={fetchBreakdownDetails} disabled={loading}>
          <Search size={16} />
        </button>
        <button type="button" className="submit-btn-top" onClick={fetchBreakdownDetails} disabled={loading}>
          SUBMIT
        </button>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
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
                  <th className="col-datetime">START DATE TIME</th>
                  <th className="col-datetime">RESUME DATE TIME</th>
                  <th className="col-comments">SUPERVISOR COMMENTS</th>
                  <th className="col-action">CPANEL</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="col-empty" style={{ textAlign: 'center', padding: '24px' }}>
                      Use filters and click Search to load breakdown details.
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={row.id}>
                      <td className="col-id">{index + 1}</td>
                      <td className="col-line">{row.line}</td>
                      <td className="col-station">{row.station}</td>
                      <td className="col-name">{row.name}</td>
                      <td className="col-shift">{row.shift}</td>
                      <td className="col-datetime">{row.startDateTime}</td>
                      <td className="col-datetime">{row.resumeDateTime}</td>
                      <td className="col-comments">
                        {editingId === row.id ? (
                          <input
                            type="text"
                            className="table-input"
                            style={{ minWidth: '120px', maxWidth: '100%' }}
                            value={editComments}
                            onChange={(e) => setEditComments(e.target.value)}
                          />
                        ) : (
                          row.comments || '—'
                        )}
                      </td>
                      <td className="col-action">
                        <div className="action-btn-group">
                          {editingId === row.id ? (
                            <>
                              <button
                                type="button"
                                className="action-btn save"
                                onClick={saveEdit}
                                disabled={saving}
                              >
                                {saving ? '...' : 'Update'}
                              </button>
                              <button
                                type="button"
                                className="action-btn cancel"
                                onClick={cancelEdit}
                                disabled={saving}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="action-btn edit"
                              onClick={() => startEdit(row)}
                            >
                              <Edit className="action-icon" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakdownManagement;
