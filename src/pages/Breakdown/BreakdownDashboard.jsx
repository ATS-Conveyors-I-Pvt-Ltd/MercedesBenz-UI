import React from 'react';
import './BreakdownDashboard.css';

const BreakdownDashboard = ({ lineName }) => {
    return (
        <div className="breakdown-container">
            <div className="breakdown-header">
                <h2>Breakdown Alarm for {lineName}</h2>
            </div>

            <div className="breakdown-grid">
                {/* L - Logistics - Blue */}
                <div className="breakdown-card-wrapper">
                    <div className="breakdown-card logistics">
                        <span className="card-label">Logistics</span>
                        <div className="card-content">
                            <span className="big-letter">L</span>
                            <span className="big-number">0</span>
                        </div>
                    </div>
                </div>

                {/* M - Maintenance - Orange */}
                <div className="breakdown-card-wrapper">
                    <div className="breakdown-card maintenance">
                        <span className="card-label">Maintenance</span>
                        <div className="card-content">
                            <span className="big-letter">M</span>
                            <span className="big-number">0</span>
                        </div>
                    </div>
                </div>

                {/* Q - Quality - White/Grey */}
                <div className="breakdown-card-wrapper">
                    <div className="breakdown-card quality">
                        <span className="card-label">Quality</span>
                        <div className="card-content">
                            <span className="big-letter">Q</span>
                            <span className="big-number">0</span>
                        </div>
                    </div>
                </div>

                {/* P - Production - Yellow */}
                <div className="breakdown-card-wrapper">
                    <div className="breakdown-card production">
                        <span className="card-label">Production</span>
                        <div className="card-content">
                            <span className="big-letter">P</span>
                            <span className="big-number">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreakdownDashboard;
