import React, { useEffect, useState } from 'react';
import './NPD.css';

const API_BASE = 'http://localhost:8909/api';

const NPDManagement = () => {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [togglingDay, setTogglingDay] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addSuccess, setAddSuccess] = useState(null);
  const [addForm, setAddForm] = useState({
    lineId: '',
    npdDate: '',
    npdDesc: '',
  });

  useEffect(() => {
    const fetchDays = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/npd/days`);
        if (!res.ok) throw new Error('Failed to load NPD days');
        const data = await res.json();
        setDays(data || []);
      } catch (e) {
        console.error(e);
        setDays([]);
        setError(e.message || 'Failed to load NPD days');
      } finally {
        setLoading(false);
      }
    };
    fetchDays();
  }, []);

  const toggleStatus = async (npdDay, turnOn) => {
    setTogglingDay(npdDay);
    setError(null);
    try {
      const on = turnOn === true;
      const params = new URLSearchParams({ on: on });
      const res = await fetch(
        `${API_BASE}/npd/days/${encodeURIComponent(npdDay)}/status?${params}`,
        { method: 'PUT' }
      );
      if (!res.ok) throw new Error('Failed to update NPD status');
      const updated = await res.json();
      setDays((prev) =>
        prev.map((d) => (d.npdDay === updated.npdDay ? updated : d))
      );
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to update NPD status');
    } finally {
      setTogglingDay(null);
    }
  };

  const openAddForm = () => {
    setShowAddForm(true);
    setAddForm({ lineId: '', npdDate: '', npdDesc: '' });
    setAddSuccess(null);
    setError(null);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setAddForm({ lineId: '', npdDate: '', npdDesc: '' });
    setAddSuccess(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const lineId = parseInt(addForm.lineId, 10);
    if (Number.isNaN(lineId) || lineId < 1) {
      setError('Enter a valid Line ID');
      return;
    }
    if (!addForm.npdDate?.trim()) {
      setError('NPD Date is required');
      return;
    }
    setAddSaving(true);
    setError(null);
    setAddSuccess(null);
    try {
      const res = await fetch(`${API_BASE}/master/npd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineId,
          npdDate: addForm.npdDate,
          npdDesc: addForm.npdDesc?.trim() || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to add NPD record');
      setAddSuccess('NPD record added successfully.');
      setAddForm({ lineId: '', npdDate: '', npdDesc: '' });
      setTimeout(() => {
        setAddSuccess(null);
        setShowAddForm(false);
      }, 1500);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to add NPD record');
    } finally {
      setAddSaving(false);
    }
  };

  /** Database: 0 = ON, 1 = OFF */
  const isOn = (day) => day.npdDayStatus === 0;

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE DAYS</h2>
        </div>
        <div className="header-actions">
          <button type="button" className="npd-add-btn" onClick={openAddForm} title="Add">
            +
          </button>
          <div className="header-brand">Mercedes-Benz India</div>
        </div>
      </div>

      {showAddForm && (
        <div className="npd-modal-overlay" onClick={closeAddForm}>
          <div className="npd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="npd-modal-header">
              <h3>Add NPD Record</h3>
              <button type="button" className="npd-modal-close" onClick={closeAddForm} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="npd-form">
              <div className="npd-form-group">
                <label htmlFor="npd-lineId">Line ID</label>
                <input
                  id="npd-lineId"
                  type="number"
                  min="1"
                  value={addForm.lineId}
                  onChange={(e) => setAddForm((f) => ({ ...f, lineId: e.target.value }))}
                  placeholder="e.g. 1"
                  required
                />
              </div>
              <div className="npd-form-group">
                <label htmlFor="npd-date">NPD Date</label>
                <input
                  id="npd-date"
                  type="date"
                  value={addForm.npdDate}
                  onChange={(e) => setAddForm((f) => ({ ...f, npdDate: e.target.value }))}
                  required
                />
              </div>
              <div className="npd-form-group">
                <label htmlFor="npd-desc">Description</label>
                <input
                  id="npd-desc"
                  type="text"
                  value={addForm.npdDesc}
                  onChange={(e) => setAddForm((f) => ({ ...f, npdDesc: e.target.value }))}
                  placeholder="NPD description"
                />
              </div>
              {addSuccess && <div className="npd-form-success">{addSuccess}</div>}
              {error && <div className="npd-form-error">{error}</div>}
              <div className="npd-form-actions">
                <button type="button" className="npd-btn-cancel" onClick={closeAddForm}>
                  Cancel
                </button>
                <button type="submit" className="npd-btn-submit" disabled={addSaving}>
                  {addSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>NPD DAYS</th>
                <th className="col-action" style={{ width: '140px' }}>CPANEL</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="col-loading">
                    Loading NPD days...
                  </td>
                </tr>
              )}
              {error && !loading && !showAddForm && (
                <tr>
                  <td colSpan={3} className="col-error">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && days.length === 0 && (
                <tr>
                  <td colSpan={3} className="col-empty">
                    No NPD days configured.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                days.map((day, index) => {
                  const on = isOn(day);
                  const busy = togglingDay === day.npdDay;
                  return (
                    <tr key={day.npdDay ?? index}>
                      <td className="col-id">{index + 1}</td>
                      <td>{day.npdDay}</td>
                      <td className="col-action">
                        <div className="toggle-switch">
                          <button
                            type="button"
                            className={`toggle-btn ${on ? 'selected green-text' : ''}`}
                            onClick={() => !busy && toggleStatus(day.npdDay, true)}
                            disabled={busy}
                          >
                            ON
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn ${!on ? 'selected red-text' : ''}`}
                            onClick={() => !busy && toggleStatus(day.npdDay, false)}
                            disabled={busy}
                          >
                            OFF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NPDManagement;
