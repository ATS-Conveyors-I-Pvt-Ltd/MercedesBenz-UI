import React from 'react';
import { Edit } from 'lucide-react';
import './Line.css';

const LineManagement = () => {
  // Screenshot 3 show a table with input fields for "LINE AUTOINDEXING TIME"
  const lines = [
    { id: 1, name: 'Trim 4', time: 117 },
    { id: 2, name: 'Trim 5', time: 117 },
    { id: 3, name: 'Trim 6', time: 110 },
    { id: 4, name: 'Mech 3', time: 117 },
    { id: 5, name: 'Mech 4', time: 151 },
    { id: 6, name: 'Mech 5', time: 150 },
    { id: 7, name: 'Finish 1', time: 117 },
    { id: 8, name: 'Finish 2', time: 117 },
  ];

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE LINE <span className="header-subtitle">line details and more</span></h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>LINE NAME</th>
                <th>LINE AUTOINDEXING TIME (sec)</th>
                <th className="col-action">CPANEL</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  <td className="col-id">{line.id}</td>
                  <td>{line.name}</td>
                  <td>
                    <input type="text" className="table-input" defaultValue={line.time} />
                  </td>
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

export default LineManagement;
