import { useState, useEffect } from 'react';
import AndonService from '../services/andonService';
import './AndonDashboard.css';

/**
 * Andon Dashboard Component
 * Displays production metrics, takt time, and line efficiency
 */
function AndonDashboard() {
    const [currentShiftData, setCurrentShiftData] = useState([]);
    const [taktTimeData, setTaktTimeData] = useState(null);
    const [timeLost, setTimeLost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLine, setSelectedLine] = useState(1);

    // Fetch current shift data on component mount
    useEffect(() => {
        fetchCurrentShift();
        const interval = setInterval(fetchCurrentShift, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Fetch takt time when line changes
    useEffect(() => {
        if (selectedLine) {
            fetchTaktTime(selectedLine);
            fetchTimeLost(selectedLine);
        }
    }, [selectedLine]);

    const fetchCurrentShift = async () => {
        setLoading(true);
        const result = await AndonService.getCurrentShift();

        if (result.success) {
            setCurrentShiftData(result.data);
            setError(null);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const fetchTaktTime = async (lineId) => {
        const result = await AndonService.getTaktTime(lineId);

        if (result.success) {
            setTaktTimeData(result.data);
        } else {
            console.error('Failed to fetch takt time:', result.error);
        }
    };

    const fetchTimeLost = async (lineId) => {
        const result = await AndonService.getTimeLost(lineId);

        if (result.success) {
            setTimeLost(result.data);
        } else {
            console.error('Failed to fetch time lost:', result.error);
        }
    };

    const handleUpdateActuals = async (id, currentValue) => {
        const newValue = prompt('Enter new actual value:', currentValue);

        if (newValue !== null && !isNaN(newValue)) {
            const result = await AndonService.updateActuals(id, parseInt(newValue));

            if (result.success) {
                alert(result.message);
                fetchCurrentShift(); // Refresh data
            } else {
                alert('Error: ' + result.error);
            }
        }
    };

    if (loading && currentShiftData.length === 0) {
        return (
            <div className="andon-dashboard">
                <div className="loading">Loading production data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="andon-dashboard">
                <div className="error">
                    <h3>Error Loading Data</h3>
                    <p>{error}</p>
                    <button onClick={fetchCurrentShift}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="andon-dashboard">
            <div className="dashboard-header">
                <h1>Andon Production Dashboard</h1>
                <div className="line-selector">
                    <label>Select Line:</label>
                    <select value={selectedLine} onChange={(e) => setSelectedLine(parseInt(e.target.value))}>
                        <option value={1}>Line 1</option>
                        <option value={2}>Line 2</option>
                        <option value={3}>Line 3</option>
                    </select>
                </div>
            </div>

            {/* Takt Time Card */}
            {taktTimeData && (
                <div className="metrics-grid">
                    <div className="metric-card takt-time">
                        <h3>Takt Time</h3>
                        <div className="metric-value">
                            {taktTimeData.taktTimeSeconds?.toFixed(2)} <span>seconds</span>
                        </div>
                        <div className="metric-details">
                            <p>Line: {taktTimeData.lineName}</p>
                            <p>Shift: {taktTimeData.shiftName}</p>
                            <p>Target: {taktTimeData.shiftTarget} units</p>
                        </div>
                    </div>

                    <div className="metric-card efficiency">
                        <h3>Line Efficiency</h3>
                        <div className="metric-value">
                            {taktTimeData.lineEfficiency?.toFixed(1)} <span>%</span>
                        </div>
                    </div>

                    {timeLost !== null && (
                        <div className="metric-card time-lost">
                            <h3>Time Lost</h3>
                            <div className="metric-value">
                                {timeLost} <span>minutes</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Current Production Table */}
            <div className="production-table">
                <h2>Current Shift Production</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Line</th>
                            <th>Station</th>
                            <th>Shift</th>
                            <th>Target</th>
                            <th>Actuals</th>
                            <th>Efficiency</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentShiftData.map((item) => {
                            const efficiency = item.shiftTarget > 0
                                ? ((item.shiftActuals / item.shiftTarget) * 100).toFixed(1)
                                : 0;

                            return (
                                <tr key={item.andonStationSummaryQueueId}>
                                    <td>{item.lineName || item.lineId}</td>
                                    <td>{item.stationName || item.stationId}</td>
                                    <td>{item.shiftName || item.shiftId}</td>
                                    <td>{item.shiftTarget}</td>
                                    <td className="actuals">{item.shiftActuals || 0}</td>
                                    <td className={efficiency >= 100 ? 'good' : efficiency >= 80 ? 'warning' : 'danger'}>
                                        {efficiency}%
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleUpdateActuals(item.andonStationSummaryQueueId, item.shiftActuals)}
                                            className="btn-update"
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="dashboard-footer">
                <p>Last updated: {new Date().toLocaleTimeString()}</p>
                <button onClick={fetchCurrentShift} className="btn-refresh">
                    Refresh Data
                </button>
            </div>
        </div>
    );
}

export default AndonDashboard;
