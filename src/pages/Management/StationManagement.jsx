import React, { useEffect, useState } from 'react';
import { Network, Edit } from 'lucide-react';
import './Station.css';

const API_BASE = 'http://localhost:8909/api';

// Map UI tab labels to backend line IDs
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

const StationManagement = () => {
  const [activeTab, setActiveTab] = useState('Trim 4');
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingStationId, setEditingStationId] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const tabs = ['Trim 4', 'Trim 5', 'Trim 6', 'Mech 3', 'Mech 4', 'Mech 5', 'Finish 1', 'Finish 2'];

  // Load stations for the selected line
  useEffect(() => {
    const lineId = LINE_ID_MAP[activeTab];
    if (!lineId) {
      setStations([]);
      return;
    }

    const fetchStations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/stations/line/${lineId}`);
        if (!res.ok) {
          throw new Error(`Failed to load stations for ${activeTab}`);
        }
        const data = await res.json();
        setStations(data || []);
      } catch (e) {
        console.error(e);
        setStations([]);
        setError(e.message || 'Failed to load stations');
      } finally {
        setLoading(false);
        setEditingStationId(null);
        setEditDescription('');
      }
    };

    fetchStations();
  }, [activeTab]);

  const startEdit = (station) => {
    setEditingStationId(station.stationId);
    setEditDescription(station.stationName || '');
  };

  const cancelEdit = () => {
    setEditingStationId(null);
    setEditDescription('');
  };

  const saveEdit = async () => {
    if (!editingStationId) return;
    setSaving(true);
    setError(null);
    try {
      const params = new URLSearchParams({ stationName: editDescription });
      const res = await fetch(
        `${API_BASE}/stations/${editingStationId}?${params.toString()}`,
        {
          method: 'PUT',
        }
      );
      if (!res.ok) {
        throw new Error('Failed to update station');
      }
      const updated = await res.json();
      setStations((prev) =>
        prev.map((s) => (s.stationId === updated.stationId ? updated : s))
      );
      setEditingStationId(null);
      setEditDescription('');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to update station');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE STATION <span className="header-subtitle">station details and more</span></h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      <div className="management-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <Network size={14} /> {tab}
          </button>
        ))}
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>DESCRIPTION</th>
                <th className="col-action">CPANEL</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="col-loading">
                    Loading stations...
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={3} className="col-error">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && stations.length === 0 && (
                <tr>
                  <td colSpan={3} className="col-empty">
                    No stations configured for this line.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                stations.map((station, index) => {
                  const isEditing = editingStationId === station.stationId;
                  return (
                    <tr key={station.stationId ?? index}>
                      <td className="col-id">{index + 1}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="table-input"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        ) : (
                          station.stationName
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
                              onClick={() => startEdit(station)}
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

export default StationManagement;
