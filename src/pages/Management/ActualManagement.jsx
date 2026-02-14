import React, { useEffect, useState } from 'react';
import { Search, Edit } from 'lucide-react';
import './Actual.css';

const API_BASE = 'http://localhost:8909/api';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ActualManagement = () => {
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
  const [editActual, setEditActual] = useState('');
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
      const res = await fetch(`${API_BASE}/actual?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load productions');
      const data = await res.json();
      setProductions(Array.isArray(data) ? data : []);
      setEditingId(null);
      setEditActual('');
    } catch (e) {
      console.error(e);
      setProductions([]);
      setError(e.message || 'Failed to load productions');
    } finally {
      setLoading(false);
    }
  };

  // Load current-date data on initial page load (no filters)
  useEffect(() => {
    fetchProductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (row) => {
    setEditingId(row.productionId);
    setEditActual(row.actualProduction != null ? String(row.actualProduction) : '0');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditActual('');
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    const actualNum = parseInt(editActual, 10);
    if (Number.isNaN(actualNum) || actualNum < 0) {
      setError('Enter a valid actual (number ≥ 0)');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const params = new URLSearchParams({ actual: actualNum });
      const res = await fetch(`${API_BASE}/actual/${editingId}?${params}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to update actual');
      const updated = await res.json();
      setProductions((prev) =>
        prev.map((p) => (p.productionId === updated.productionId ? updated : p))
      );
      setEditingId(null);
      setEditActual('');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to update actual');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE ACTUAL</h2>
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
            <table className="management-table actual-table">
              <thead>
                <tr>
                  <th className="col-id">#</th>
                  <th>LINE NAME</th>
                  <th>SHIFT NAME</th>
                  <th>DATE</th>
                  <th>ACTUAL</th>
                  <th className="col-action">CPANEL</th>
                </tr>
              </thead>
              <tbody>
                {productions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="col-empty">
                      Use filters and click Search to load productions.
                    </td>
                  </tr>
                ) : (
                  productions.map((row, index) => (
                    <tr
                      key={row.productionId}
                      className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                    >
                      <td className="col-id">{index + 1}</td>
                      <td>{row.lineName}</td>
                      <td>{row.shiftName}</td>
                      <td>{formatDate(row.productionDate)}</td>
                      <td>
                        {editingId === row.productionId ? (
                          <input
                            type="number"
                            className="table-input"
                            min={0}
                            value={editActual}
                            onChange={(e) => setEditActual(e.target.value)}
                            style={{ maxWidth: '80px' }}
                          />
                        ) : (
                          <input
                            type="number"
                            className="table-input"
                            defaultValue={row.actualProduction}
                            style={{ maxWidth: '80px' }}
                            readOnly
                          />
                        )}
                      </td>
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

export default ActualManagement;
