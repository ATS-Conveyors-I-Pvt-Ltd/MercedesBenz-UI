import React, { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
import './Line.css';

import { BASE_URL } from '../../constants';

const LineManagement = () => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingLineId, setEditingLineId] = useState(null);
  const [editTime, setEditTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLines = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/lines`);
        if (!res.ok) throw new Error('Failed to load lines');
        const data = await res.json();
        setLines(data || []);
      } catch (e) {
        console.error(e);
        setLines([]);
        setError(e.message || 'Failed to load lines');
      } finally {
        setLoading(false);
        setEditingLineId(null);
        setEditTime('');
      }
    };
    fetchLines();
  }, []);

  const startEdit = (line) => {
    setEditingLineId(line.lineId);
    setEditTime(line.autoIndexTime != null ? String(line.autoIndexTime) : '');
  };

  const cancelEdit = () => {
    setEditingLineId(null);
    setEditTime('');
  };

  const saveEdit = async () => {
    if (editingLineId == null) return;
    const timeNum = parseInt(editTime, 10);
    if (Number.isNaN(timeNum) || timeNum < 0) {
      setError('Enter a valid number (seconds)');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const params = new URLSearchParams({ autoIndexTime: timeNum });
      const res = await fetch(`${BASE_URL}/lines/${editingLineId}?${params}`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to update line');
      const updated = await res.json();
      setLines((prev) =>
        prev.map((l) => (l.lineId === updated.lineId ? updated : l))
      );
      setEditingLineId(null);
      setEditTime('');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to update line');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE LINE</h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>LINE NAME</th>
                <th>LINE AUTOINDEXING TIME (sec)</th>
                <th className="col-action">CPANEL</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="col-loading">
                    Loading lines...
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={4} className="col-error">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && lines.length === 0 && (
                <tr>
                  <td colSpan={4} className="col-empty">
                    No lines configured.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                lines.map((line, index) => {
                  const isEditing = editingLineId === line.lineId;
                  return (
                    <tr key={line.lineId ?? index}>
                      <td className="col-id">{index + 1}</td>
                      <td>{line.lineName}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            className="table-input"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                          />
                        ) : (
                          line.autoIndexTime ?? '-'
                        )}
                      </td>
                      <td className="col-action">
                        <div className="action-btn-group">
                          {isEditing ? (
                            <>
                              <button
                                className="action-btn save"
                                onClick={saveEdit}
                                disabled={saving}
                              >
                                {saving ? 'Saving...' : 'Update'}
                              </button>
                              <button
                                className="action-btn cancel"
                                onClick={cancelEdit}
                                disabled={saving}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="action-btn edit"
                              onClick={() => startEdit(line)}
                            >
                              <Edit className="action-icon" />
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
    </div>
  );
};

export default LineManagement;
