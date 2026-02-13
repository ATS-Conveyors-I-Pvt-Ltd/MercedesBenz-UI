import React, { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
import './Target.css';

const API_BASE = 'http://localhost:8909/api';

const LINE_ID_MAP = {
  'Trim 4': 1,
  'Trim 5': 2,
  'Trim 6': 3,
  'Mech 3': 4,
  'Mech 4': 5,
  'Mech 5': 6,
  'Finish 1': 7,
  'Finish 2': 8,
};

const TargetManagement = () => {
  const [activeTab, setActiveTab] = useState('Trim 4');
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTarget, setEditTarget] = useState('');
  const [saving, setSaving] = useState(false);

  const tabs = Object.keys(LINE_ID_MAP);

  useEffect(() => {
    const lineId = LINE_ID_MAP[activeTab];
    if (!lineId) {
      setTargets([]);
      return;
    }

    const fetchTargets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/line-target/line/${lineId}`);
        if (!res.ok) throw new Error('Failed to load targets');
        const data = await res.json();
        setTargets(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setTargets([]);
        setError(e.message || 'Failed to load targets');
      } finally {
        setLoading(false);
        setEditingId(null);
        setEditTarget('');
      }
    };

    fetchTargets();
  }, [activeTab]);

  const startEdit = (row) => {
    setEditingId(row.lineShiftTargetId);
    setEditTarget(row.target != null ? String(row.target) : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTarget('');
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    const targetNum = parseInt(editTarget, 10);
    if (Number.isNaN(targetNum) || targetNum < 0) {
      setError('Enter a valid target (number ≥ 0)');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const params = new URLSearchParams({ target: targetNum });
      const res = await fetch(`${API_BASE}/line-target/${editingId}?${params}`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to update target');
      const updated = await res.json();
      setTargets((prev) =>
        prev.map((t) =>
          t.lineShiftTargetId === updated.lineShiftTargetId ? updated : t
        )
      );
      setEditingId(null);
      setEditTarget('');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to update target');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE LINE SHIFT TARGET</h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      <div className="management-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table target-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th className="col-line-name">LINE NAME</th>
                <th className="col-shift-name">SHIFT NAME</th>
                <th className="col-target">TARGET(Unit)</th>
                <th className="col-takt">TAKT TIME(hh:mm:ss)</th>
                <th className="col-action">C PANEL</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="col-loading">
                    Loading targets...
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={6} className="col-error">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && targets.length === 0 && (
                <tr>
                  <td colSpan={6} className="col-empty">
                    No targets for this line.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                targets.map((row, index) => {
                  const isEditing = editingId === row.lineShiftTargetId;
                  return (
                    <tr
                      key={row.lineShiftTargetId ?? index}
                      className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                    >
                      <td className="col-id">{index + 1}</td>
                      <td className="col-line-name text-green-dark">{activeTab}</td>
                      <td className="col-shift-name text-green-dark">
                        SHIFT {row.shiftId ?? '-'}
                      </td>
                      <td className="col-target">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            className="target-input"
                            value={editTarget}
                            onChange={(e) => setEditTarget(e.target.value)}
                          />
                        ) : (
                          row.target ?? '-'
                        )}
                      </td>
                      <td className="col-takt">-</td>
                      <td className="col-action">
                        <div className="action-btn-group">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                className="action-btn save"
                                onClick={saveEdit}
                                disabled={saving}
                              >
                                {saving ? 'Saving...' : 'Update'}
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
                              className="action-btn black-btn"
                              onClick={() => startEdit(row)}
                            >
                              <Edit className="action-icon" size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="management-footer">
        <div className="footer-left">
          <span className="iprod-logo">iPROD</span> smart connected enterprise
          platform
        </div>
        <div className="footer-copyright">
          All rights reserved. © Copyright 2018 I04 Realms.
        </div>
        <div className="footer-date">
          {new Date().toLocaleString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}{' '}
          |{' '}
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </div>
      </div>
    </div>
  );
};

export default TargetManagement;
