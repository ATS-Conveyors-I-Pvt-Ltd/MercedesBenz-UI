import React, { useState } from 'react';
import './NPD.css';

const NPDManagement = () => {
  const [days, setDays] = useState([
    { id: 1, day: 'Sunday', status: 'ON' },
    { id: 2, day: 'Monday', status: 'ON' },
    { id: 3, day: 'Tuesday', status: 'ON' },
    { id: 4, day: 'Wednesday', status: 'ON' },
    { id: 5, day: 'Thursday', status: 'ON' },
    { id: 6, day: 'Friday', status: 'ON' },
    { id: 7, day: 'Saturday', status: 'ON' },
  ]);

  const toggleStatus = (id, newStatus) => {
    setDays(days.map(day =>
      day.id === id ? { ...day, status: newStatus } : day
    ));
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE DAYS <span className="header-subtitle">days details and more</span></h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>NPD DAYS</th>
                <th className="col-action" style={{ width: '140px' }}>CPANEL</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, index) => (
                <tr key={index}>
                  <td className="col-id">{day.id}</td>
                  <td>{day.day}</td>
                  <td className="col-action">
                    <div className="toggle-switch">
                      <button
                        className={`toggle-btn ${day.status === 'ON' ? 'selected green-text' : ''}`}
                        onClick={() => toggleStatus(day.id, 'ON')}
                      >
                        ON
                      </button>
                      <button
                        className={`toggle-btn ${day.status === 'OFF' ? 'selected red-text' : ''}`}
                        onClick={() => toggleStatus(day.id, 'OFF')}
                      >
                        OFF
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

export default NPDManagement;
