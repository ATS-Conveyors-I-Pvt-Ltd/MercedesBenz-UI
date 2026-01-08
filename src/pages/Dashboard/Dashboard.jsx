import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    // Mock data based on the screenshot (16 Dec 2025)
    // The screenshot shows single vertical lines of dots, implying data points for specific dates.
    // I'll create a few data points to make it a line chart, but focus on the '16 Dec 2025' values shown in the tooltip.
    const data = [
        {
            date: '10 Dec 2025',
            Logistics: 30,
            Maintenance: 20,
            Production: 10,
            Quality: 5,

            // Time data (bottom chart values - hypothetical based on scale)
            LogisticsTime: 10000,
            MaintenanceTime: 6000,
            ProductionTime: 4000,
            QualityTime: 2000,
        },
        {
            date: '16 Dec 2025',
            Logistics: 39,
            Maintenance: 26,
            Production: 10,
            Quality: 0,

            // Time data
            LogisticsTime: 12000,
            MaintenanceTime: 6200,
            ProductionTime: 4500,
            QualityTime: 1000,
        },
        {
            date: '20 Dec 2025',
            Logistics: 45,
            Maintenance: 30,
            Production: 15,
            Quality: 8,

            // Time data
            LogisticsTime: 11000,
            MaintenanceTime: 5000,
            ProductionTime: 3000,
            QualityTime: 1500,
        }
    ];

    // Custom tooltips to match the grey box style in screenshot
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="tooltip-item">
                            <span className="color-box" style={{ backgroundColor: entry.color }}></span>
                            <span className="tooltip-name">{entry.name}</span>
                            <span className="tooltip-value">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dashboard-home-charts">
            <div className="charts-header">
                <h1>Mercedes-Benz India</h1>
                <h2>PRODUCTION STATUS</h2>
            </div>

            {/* Top Chart: Count of Alarm */}
            <div className="chart-container">
                <h3 className="chart-title">Count Of Alarm per Stakeholders</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="colorLogistics" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1f77b4" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#1f77b4" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff7f0e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ff7f0e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d62728" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#d62728" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2ca02c" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#2ca02c" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} label={{ value: 'Counters', angle: -90, position: 'insideLeft', offset: 0, fill: '#666' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#999', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                        <Area type="monotone" dataKey="Logistics" stroke="#1f77b4" strokeWidth={3} fillOpacity={1} fill="url(#colorLogistics)" dot={{ r: 4, fill: '#1f77b4', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="Maintenance" stroke="#ff7f0e" strokeWidth={3} fillOpacity={1} fill="url(#colorMaintenance)" dot={{ r: 4, fill: '#ff7f0e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="Production" stroke="#d62728" strokeWidth={3} fillOpacity={1} fill="url(#colorProduction)" dot={{ r: 4, fill: '#d62728', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="Quality" stroke="#2ca02c" strokeWidth={3} fillOpacity={1} fill="url(#colorQuality)" dot={{ r: 4, fill: '#2ca02c', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Chart: Total Time */}
            <div className="chart-container">
                <h3 className="chart-title">Total Time per Stakeholder</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <defs>
                            {/* Reusing gradients or defining new ones if needed. Reusing for consistency. */}
                            <linearGradient id="colorLogisticsTime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1f77b4" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#1f77b4" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMaintenanceTime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff7f0e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ff7f0e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorProductionTime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d62728" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#d62728" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorQualityTime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2ca02c" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#2ca02c" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} label={{ value: 'Time', angle: -90, position: 'insideLeft', fill: '#666' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#999', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                        <Area type="monotone" dataKey="LogisticsTime" name="Logistics" stroke="#1f77b4" strokeWidth={3} fillOpacity={1} fill="url(#colorLogisticsTime)" dot={{ r: 4, fill: '#1f77b4', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="MaintenanceTime" name="Maintenance" stroke="#ff7f0e" strokeWidth={3} fillOpacity={1} fill="url(#colorMaintenanceTime)" dot={{ r: 4, fill: '#ff7f0e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="ProductionTime" name="Production" stroke="#d62728" strokeWidth={3} fillOpacity={1} fill="url(#colorProductionTime)" dot={{ r: 4, fill: '#d62728', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="QualityTime" name="Quality" stroke="#2ca02c" strokeWidth={3} fillOpacity={1} fill="url(#colorQualityTime)" dot={{ r: 4, fill: '#2ca02c', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
