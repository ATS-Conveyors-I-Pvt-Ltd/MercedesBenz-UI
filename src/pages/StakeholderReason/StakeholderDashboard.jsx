import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import { Activity, Clock, AlertTriangle, Users, Search } from 'lucide-react';
import './StakeholderDashboard.css';

const StakeholderDashboard = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedLine, setSelectedLine] = useState('All Lines');
    const [selectedShift, setSelectedShift] = useState('All Shifts');
    const [lines, setLines] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const shifts = ['SHIFT 1', 'SHIFT 2', 'SHIFT 3'];

    useEffect(() => {
        fetchLines();
        fetchDashboardData();
    }, []);

    const fetchLines = async () => {
        try {
            const res = await fetch('http://localhost:8909/api/lines');
            if (res.ok) {
                const data = await res.json();
                setLines(data || []);
            }
        } catch (e) {
            console.error("Failed to fetch lines", e);
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/breakdownReasonReports/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromDate: fromDate || null,
                    toDate: toDate || null,
                    line: selectedLine === 'All Lines' ? null : selectedLine,
                    shift: selectedShift === 'All Shifts' ? null : selectedShift
                })
            });
            const result = await response.json();
            if (result.success && result.data && result.data.length > 0) {
                setData(result.data[0]);
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;

    const alarmData = data?.alarmCountByStakeholder ? Object.entries(data.alarmCountByStakeholder).map(([name, value]) => ({ name, value })) : [];
    const timeData = data?.totalTimeByStakeholder ? Object.entries(data.totalTimeByStakeholder).map(([name, value]) => ({ name, value })) : [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>STAKEHOLDER DASHBOARD</h1>
                    <p>Real-time monitoring of stakeholder alarms and durations</p>
                </div>
                <Users className="header-icon" />
            </header>

            <div className="dashboard-filters-bar">
                <div className="filter-group">
                    <label>From Date</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="filter-group">
                    <label>To Date</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
                <div className="filter-group">
                    <label>Line</label>
                    <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
                        <option>All Lines</option>
                        {lines.map(l => <option key={l.lineId} value={l.lineName}>{l.lineName}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Shift</label>
                    <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}>
                        <option>All Shifts</option>
                        {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button className="dashboard-search-btn" onClick={fetchDashboardData}>
                    <Search size={18} />
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card total-alarms">
                    <div className="stat-content">
                        <h3>Total Alarms</h3>
                        <p className="stat-value">{alarmData.reduce((acc, curr) => acc + curr.value, 0)}</p>
                    </div>
                    <AlertTriangle className="stat-icon" />
                </div>
                <div className="stat-card total-duration">
                    <div className="stat-content">
                        <h3>Total Duration</h3>
                        <p className="stat-value">{timeData.reduce((acc, curr) => acc + curr.value, 0)} <small>min</small></p>
                    </div>
                    <Clock className="stat-icon" />
                </div>
                <div className="stat-card avg-duration">
                    <div className="stat-content">
                        <h3>Avg. Duration</h3>
                        <p className="stat-value">
                            {(timeData.reduce((acc, curr) => acc + curr.value, 0) / (alarmData.reduce((acc, curr) => acc + curr.value, 0) || 1)).toFixed(1)}
                            <small>min</small>
                        </p>
                    </div>
                    <Activity className="stat-icon" />
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-item">
                    <h3>Alarm Distribution per Stakeholder</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={alarmData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {alarmData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-item">
                    <h3>Duration Distribution per Stakeholder (min)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={timeData}
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {timeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StakeholderDashboard;
