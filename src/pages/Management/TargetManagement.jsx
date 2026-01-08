import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import './Target.css';

const TargetManagement = () => {
  // Mock data matching the screenshot
  const data = [
    { id: 1, line: 'Trim 4', shift: 'SHIFT 1', target: 20, takt: '00:22:00' },
    { id: 2, line: 'Trim 4', shift: 'SHIFT 2', target: 0, takt: '00:00:00' },
    { id: 3, line: 'Trim 5', shift: 'SHIFT 1', target: 1, takt: '07:20:00' },
    { id: 4, line: 'Trim 5', shift: 'SHIFT 2', target: 0, takt: '00:00:00' },
    { id: 5, line: 'Trim 5', shift: 'SHIFT 3', target: 0, takt: '00:00:00' },
    { id: 6, line: 'Trim 6', shift: 'SHIFT 1', target: 19, takt: '00:23:09' },
    { id: 7, line: 'Trim 6', shift: 'SHIFT 2', target: 0, takt: '00:00:00' },
    { id: 8, line: 'Trim 6', shift: 'SHIFT 3', target: 0, takt: '00:00:00' },
    { id: 9, line: 'Mech 3', shift: 'SHIFT 1', target: 21, takt: '00:20:57' },
    { id: 10, line: 'Mech 3', shift: 'SHIFT 2', target: 0, takt: '00:00:00' },
    { id: 11, line: 'Mech 3', shift: 'SHIFT 3', target: 0, takt: '00:00:00' },
    { id: 12, line: 'Mech 4', shift: 'SHIFT 1', target: 1, takt: '07:20:00' },
    { id: 13, line: 'Mech 4', shift: 'SHIFT 2', target: 0, takt: '00:00:00' },
    { id: 14, line: 'Mech 4', shift: 'SHIFT 3', target: 0, takt: '00:00:00' },
    { id: 15, line: 'Mech 5', shift: 'SHIFT 1', target: 20, takt: '00:22:00' },
    { id: 16, line: 'Mech 5', shift: 'SHIFT 2', target: 0, takt: '00:00:00' },
    { id: 17, line: 'Mech 5', shift: 'SHIFT 3', target: 0, takt: '00:00:00' },
    { id: 18, line: 'Finish 1', shift: 'SHIFT 1', target: 0, takt: '00:00:00' },
  ];

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE LINE SHIFT TARGET <span className="header-subtitle">line shift details and more</span></h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table target-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>LINE NAME</th>
                <th>SHIFT NAME</th>
                <th>TARGET(Unit)</th>
                <th>TAKT TIME(hh:mm:ss)</th>
                <th className="col-action">C PANEL</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="col-id">{row.id}</td>
                  <td className="text-green-dark">{row.line}</td>
                  <td className="text-green-dark">{row.shift}</td>
                  <td>
                    <input type="number" className="target-input" defaultValue={row.target} />
                  </td>
                  <td>{row.takt}</td>
                  <td className="col-action">
                    <div className="action-btn-group">
                      <button className="action-btn black-btn">
                        <Edit className="action-icon" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="management-footer">
        <div className="footer-left">
          <span className="iprod-logo">iPROD</span> smart connected enterprise platform
        </div>
        <div className="footer-copyright">
          All rights reserved. © Copyright 2018 I04 Realms.
        </div>
        <div className="footer-date">
          {new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
      </div>
    </div>
  );
};

export default TargetManagement;
