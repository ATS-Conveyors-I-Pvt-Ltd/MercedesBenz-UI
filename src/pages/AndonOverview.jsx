import React from 'react';
import './AndonOverview.css';

const AndonOverview = () => {
    return (
        <div className="andon-overview-container">
            <div className="andon-content-row">
                <div className="chart-panel">
                    <button className="download-btn">Download HTML</button>
                    <h3>Target vs Actual Count Comparison</h3>
                    <div className="bar-chart-visualization">
                        {/* Simplified visual representation of the bar chart in the original HTML */}
                        <div className="bar target-bar"></div>
                        <div className="bar actual-bar"></div>
                    </div>
                    <div className="chart-legend">TARGET COUNT (BLUE) | ACTUAL COUNT (GREEN)</div>
                </div>

                <div className="alerts-panel">
                    <div className="andon-status-panel">
                        <span className="indicator"></span>
                        <span className="panel-title">Trim 4</span>
                        <div className="stat-group"><span className="count-box">2</span><span className="label">COUNT</span></div>
                        <div className="stat-group"><span className="time-box">4.1</span><span className="label">TIME(mins.)</span></div>
                    </div>

                    <div className="andon-status-panel">
                        <span className="indicator"></span>
                        <span className="panel-title">Trim 5</span>
                        <div className="stat-group"><span className="count-box">5</span><span className="label">COUNT</span></div>
                        <div className="stat-group"><span className="time-box">1.11</span><span className="label">TIME(mins.)</span></div>
                    </div>

                    <div className="andon-status-panel">
                        <span className="indicator"></span>
                        <span className="panel-title">Trim 6</span>
                        <div className="stat-group"><span className="count-box">3</span><span className="label">COUNT</span></div>
                        <div className="stat-group"><span className="time-box">2.11</span><span className="label">TIME(mins.)</span></div>
                    </div>

                    <div className="andon-status-panel">
                        <span className="indicator"></span>
                        <span className="panel-title">Mechanical 3</span>
                        <div className="stat-group"><span className="count-box">4</span><span className="label">COUNT</span></div>
                        <div className="stat-group"><span className="time-box">5.1</span><span className="label">TIME(mins.)</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AndonOverview;
