import React, { useState, useEffect } from 'react';
import './BreakdownDashboard.css';

const API_BASE = 'http://localhost:8087/api/breakdown';

const BreakdownDashboard = ({ lineId, lineName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lIndex, setLIndex] = useState(0);
  const [mIndex, setMIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [pIndex, setPIndex] = useState(0);

  useEffect(() => {
    if (!lineId) {
      setLoading(false);
      return;
    }
    const fetchBreakdowns = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/details/line/${lineId}`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setData(json.data);
          setError(null);
        } else {
          setData([]);
          const msg = (json.message || '').toLowerCase();
          const isNoDataMessage = msg.includes('no breakdown') || msg.includes('no data') || msg.includes('to be displayed');
          setError(isNoDataMessage ? null : (json.message || 'Failed to load breakdown data'));
        }
      } catch {
        setData([]);
        setError('Unable to connect to breakdown service. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchBreakdowns();
  }, [lineId]);

  const getStationsByStakeholder = (keywords) => {
    const upperKeywords = keywords.map((k) => k.toUpperCase());
    const matches = data.filter((row) => {
      const name = (row.breakdownName || '').toUpperCase();
      return upperKeywords.some((k) => name.includes(k));
    });
    return matches
      .map((row) => row.stationName)
      .filter((s) => s != null && s !== '');
  };

  const lStations = getStationsByStakeholder(['logistics']);
  const mStations = getStationsByStakeholder(['maintenance']);
  const qStations = getStationsByStakeholder(['quality']);
  const pStations = getStationsByStakeholder(['production', 'pull cord']);

  // Reset rotation indices whenever data changes (new line / new alarms)
  useEffect(() => {
    setLIndex(0);
    setMIndex(0);
    setQIndex(0);
    setPIndex(0);
  }, [lineId, data.length]);

  // Rotate through station names every 5 seconds when more than one station
  useEffect(() => {
    const interval = setInterval(() => {
      setLIndex((prev) =>
        lStations.length > 1 ? (prev + 1) % lStations.length : prev
      );
      setMIndex((prev) =>
        mStations.length > 1 ? (prev + 1) % mStations.length : prev
      );
      setQIndex((prev) =>
        qStations.length > 1 ? (prev + 1) % qStations.length : prev
      );
      setPIndex((prev) =>
        pStations.length > 1 ? (prev + 1) % pStations.length : prev
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [lStations.length, mStations.length, qStations.length, pStations.length]);

  const lStation =
    lStations.length === 0 ? 0 : lStations[lIndex % lStations.length];
  const mStation =
    mStations.length === 0 ? 0 : mStations[mIndex % mStations.length];
  const qStation =
    qStations.length === 0 ? 0 : qStations[qIndex % qStations.length];
  const pStation =
    pStations.length === 0 ? 0 : pStations[pIndex % pStations.length];

  const formatTime = (t) => (t ? t.toString().slice(0, 8) : '-');
  const formatDate = (d) => (d ? d.toString() : '-');

  return (
    <div className="breakdown-container">
      <div className="breakdown-header">
        <h2>Breakdown Alarm for {lineName || 'Line'}</h2>
      </div>

      {loading && (
        <div className="breakdown-loading">Loading breakdown data...</div>
      )}
      {error && (
        <div className="breakdown-error">{error}</div>
      )}

      {!loading && !error && (
        <>
          {data.length === 0 && (
            <div className="breakdown-no-data">There is no breakdown to be displayed.</div>
          )}
          <div className="breakdown-grid">
            <div className="breakdown-card-wrapper">
              <div className="breakdown-card logistics">
                <div className="card-content">
                  <span className="big-letter">L</span>
                  <span className="card-divider" />
                  <span className="big-number">{lStation}</span>
                </div>
              </div>
            </div>
            <div className="breakdown-card-wrapper">
              <div className="breakdown-card maintenance">
                <div className="card-content">
                  <span className="big-letter">M</span>
                  <span className="card-divider" />
                  <span className="big-number">{mStation}</span>
                </div>
              </div>
            </div>
            <div className="breakdown-card-wrapper">
              <div className="breakdown-card quality">
                <div className="card-content">
                  <span className="big-letter">Q</span>
                  <span className="card-divider" />
                  <span className="big-number">{qStation}</span>
                </div>
              </div>
            </div>
            <div className="breakdown-card-wrapper">
              <div className="breakdown-card production">
                <div className="card-content">
                  <span className="big-letter">P</span>
                  <span className="card-divider" />
                  <span className="big-number">{pStation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown details table intentionally hidden per requirement */}
        </>
      )}
    </div>
  );
};

export default BreakdownDashboard;
