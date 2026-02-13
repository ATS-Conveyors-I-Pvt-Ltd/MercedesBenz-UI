import React, { useState } from 'react';
import { Network, Edit } from 'lucide-react';
import './Shift.css';

const ShiftManagement = () => {
  const [activeTab, setActiveTab] = useState('Trim 4');
  const tabs = ['Trim 4', 'Trim 5', 'Trim 6', 'Mech 3', 'Mech 4', 'Mech 5', 'Finish 1', 'Finish 2'];

  const shifts = [
    { id: 1, description: 'SHIFT 1' },
    { id: 2, description: 'SHIFT 3' },
    { id: 3, description: 'SHIFT 2' }
  ];

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE SHIFT</h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      <div className="management-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <Network size={14} /> {tab}
          </button>
        ))}
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>DESCRIPTION</th>
                <th className="col-action">CPANEL</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift, index) => (
                <tr key={index}>
                  <td className="col-id">{shift.id}</td>
                  <td>{shift.description}</td>
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

export default ShiftManagement;
