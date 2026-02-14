import React, { useEffect, useState } from 'react';
import { Search, Edit } from 'lucide-react';
import './LostTime.css';

const API_BASE = 'http://localhost:8909/api';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Convert seconds to HH:MM:SS */
const secsToHhMmSs = (totalSecs) => {
  if (totalSecs == null || totalSecs < 0) return '00:00:00';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
};

/** Parse HH:MM:SS or H:MM:SS to total seconds */
const hhMmSsToSec = (str) => {
  if (!str || typeof str !== 'string') return 0;
  const parts = str.trim().split(':').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n < 0)) return 0;
  const [h, m, s] = parts;
  return h * 3600 + m * 60 + s;
};

const LostTimeManagement = () => {
  const [productions, setProductions] = useState([]);
  const [lines, setLines] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [lineId, setLineId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editLostTime, setEditLostTime] = useState('00:00:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch(`${API_BASE}/lines`);
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
        const res = await fetch(`${API_BASE}/shifts`);
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

  const fetchProductions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set('fromDate', fromDate);
      if (toDate) params.set('toDate', toDate);
      if (lineId) params.set('lineId', lineId);
      if (shiftId) params.set('shiftId', shiftId);
      const res = await fetch(`${API_BASE}/lost-time?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load productions');
      const data = await res.json();
      setProductions(Array.isArray(data) ? data : []);
      setEditingId(null);
      setEditLostTime('00:00:00');
    } catch (e) {
      console.error(e);
      setProductions([]);
      setError(e.message || 'Failed to load productions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (row) => {
    setEditingId(row.productionId);
    setEditLostTime(secsToHhMmSs(row.lossTimeSec));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLostTime('00:00:00');
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    const secs = hhMmSsToSec(editLostTime);
    setSaving(true);
    setError(null);
    try {
      const params = new URLSearchParams({ lossTimeSec: secs });
      const res = await fetch(`${API_BASE}/lost-time/${editingId}?${params}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to update lost time');
      const updated = await res.json();
      setProductions((prev) =>
        prev.map((p) => (p.productionId === updated.productionId ? updated : p))
      );
      setEditingId(null);
      setEditLostTime('00:00:00');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to update lost time');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE LOST TIME</h2>
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
        <button type="button" className="search-btn" onClick={fetchProductions} disabled={loading}>
          <Search size={16} />
        </button>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: '24px', textAlign: 'center' }}>Loading...</p>
          ) : (
            <table className="management-table lost-time-table">
              <thead>
                <tr>
                  <th className="col-id">#</th>
                  <th>LINE NAME</th>
                  <th>SHIFT NAME</th>
                  <th>DATE</th>
                  <th>LOST TIME (hh:mm:ss)</th>
                  <th>REASON</th>
                  <th className="col-action">CPANEL</th>
                </tr>
              </thead>
              <tbody>
                {productions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="col-empty">
                      Use filters and click Search to load productions.
                    </td>
                  </tr>
                ) : (
                  productions.map((row, index) => (
                    <tr key={row.productionId}>
                      <td className="col-id">{index + 1}</td>
                      <td>{row.lineName}</td>
                      <td>{row.shiftName}</td>
                      <td>{formatDate(row.productionDate)}</td>
                      <td>
                        {editingId === row.productionId ? (
                          <input
                            type="text"
                            className="table-input"
                            placeholder="HH:MM:SS"
                            value={editLostTime}
                            onChange={(e) => setEditLostTime(e.target.value)}
                            style={{ maxWidth: '100px' }}
                          />
                        ) : (
                          secsToHhMmSs(row.lossTimeSec)
                        )}
                      </td>
                      <td>—</td>
                      <td className="col-action">
                        <div className="action-btn-group">
                          {editingId === row.productionId ? (
                            <>
                              <button
                                type="button"
                                className="action-btn save"
                                onClick={saveEdit}
                                disabled={saving}
                              >
                                {saving ? '...' : 'Save'}
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

export default LostTimeManagement;
