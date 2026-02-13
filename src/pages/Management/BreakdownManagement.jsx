import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './Breakdown.css';

const BreakdownManagement = () => {
  // Mock data matching uploaded image 0
  const data = [
    { id: 1, line: 'Trim 6', station: '4', name: 'MAINTENANCE', shift: 'SHIFT 1', startDate: '16 Dec 2025', startTime: '07:00:12', resumeDate: '16 Dec 2025', resumeTime: '07:03:03' },
    { id: 2, line: 'Trim 4', station: '6', name: 'LOGISTICS', shift: 'SHIFT 1', startDate: '16 Dec 2025', startTime: '07:02:10', resumeDate: '16 Dec 2025', resumeTime: '07:12:10' },
    { id: 3, line: 'Mech 3', station: '17', name: 'LOGISTICS', shift: 'SHIFT 1', startDate: '16 Dec 2025', startTime: '07:03:11', resumeDate: '16 Dec 2025', resumeTime: '07:07:37' },
    { id: 4, line: 'Finish 2', station: '6', name: 'PULL CORD', shift: 'SHIFT 1', startDate: '16 Dec 2025', startTime: '07:06:56', resumeDate: '16 Dec 2025', resumeTime: '07:22:18' },
    { id: 5, line: 'Finish 2', station: '5', name: 'PULL CORD', shift: 'SHIFT 1', startDate: '16 Dec 2025', startTime: '07:06:57', resumeDate: '16 Dec 2025', resumeTime: '07:22:14' },
    { id: 6, line: 'Trim 4', station: '9', name: 'LOGISTICS', shift: 'SHIFT 1', startDate: '16 Dec 2025', startTime: '07:09:13', resumeDate: '16 Dec 2025', resumeTime: '07:23:28' },
    // ... more rows as needed
  ];

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE BREAKDOWN DETAILS</h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      {/* Filter Bar */}
      <div className="management-filters">
        <div className="filter-group">
          <span className="filter-label">From Date</span>
          <input type="date" className="filter-input" placeholder="dd-mm-yyyy" />
        </div>
        <div className="filter-group">
          <span className="filter-label">To Date</span>
          <input type="date" className="filter-input" placeholder="dd-mm-yyyy" />
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option>--All Lines--</option>
            <option>Trim 4</option>
            <option>Trim 5</option>
          </select>
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option>--All Shifts--</option>
            <option>Shift 1</option>
            <option>Shift 2</option>
          </select>
        </div>
        <button className="search-btn">
          <Search size={16} />
        </button>

        <button className="submit-btn-top">SUBMIT</button>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>LINE NAME</th>
                <th>STATION NAME</th>
                <th>NAME</th>
                <th>SHIFT NAME</th>
                <th>START DATE</th>
                <th className="text-right">START TIME</th>
                <th>RESUME DATE</th>
                <th className="text-right">RESUME TIME</th>
                <th>SUPERVISOR COMMENTS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="col-id">{row.id}</td>
                  <td>{row.line}</td>
                  <td>{row.station}</td>
                  <td>{row.name}</td>
                  <td>{row.shift}</td>
                  <td>{row.startDate}</td>
                  <td className="text-right">{row.startTime}</td>
                  <td>{row.resumeDate}</td>
                  <td className="text-right">{row.resumeTime}</td>
                  <td>
                    <input type="text" className="table-input" style={{ minWidth: '200px' }} />
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

export default BreakdownManagement;
