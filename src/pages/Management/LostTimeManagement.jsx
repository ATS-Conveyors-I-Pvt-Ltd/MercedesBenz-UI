import React, { useState } from 'react';
import { Search, Edit } from 'lucide-react';
import './LostTime.css';

const LostTimeManagement = () => {
  // No specific screenshot, but assuming similar to Breakdown/Actual
  const data = [
    { id: 1, line: 'Trim 4', shift: 'SHIFT 1', date: '16 Dec 2025', lostTime: '00:10:00', reason: 'Machine Fault' },
    { id: 2, line: 'Trim 5', shift: 'SHIFT 1', date: '16 Dec 2025', lostTime: '00:00:00', reason: '-' },
  ];

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE LOST TIME <span className="header-subtitle">lost time details and more</span></h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      {/* Filter Bar */}
      <div className="management-filters">
        <div className="filter-group">
          <span className="filter-label">From Date</span>
          <input type="date" className="filter-input" />
        </div>
        <div className="filter-group">
          <span className="filter-label">To Date</span>
          <input type="date" className="filter-input" />
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option>--All Lines--</option>
          </select>
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option>--All Shifts--</option>
          </select>
        </div>
        <button className="search-btn">
          <Search size={16} />
        </button>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>LINE NAME</th>
                <th>SHIFT NAME</th>
                <th>DATE</th>
                <th>LOST TIME (hh:mm:ss)</th>
                <th>REASON</th>
                <th className="col-action">CPANEL</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="col-id">{row.id}</td>
                  <td>{row.line}</td>
                  <td>{row.shift}</td>
                  <td>{row.date}</td>
                  <td>{row.lostTime}</td>
                  <td>{row.reason}</td>
                  <td className="col-action">
                    <div className="action-btn-group">
                      <button className="action-btn edit">
                        <Edit className="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LostTimeManagement;
