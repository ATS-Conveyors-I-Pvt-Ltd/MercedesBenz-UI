import React, { useState } from 'react';
import { Network, Edit } from 'lucide-react';
import './Station.css';

const StationManagement = () => {
  // ...
  // Note: Applying full file replacement for reliability.
  const [activeTab, setActiveTab] = useState('Trim 4');
  const tabs = ['Trim 4', 'Trim 5', 'Trim 6', 'Mech 3', 'Mech 4', 'Mech 5', 'Finish 1', 'Finish 2'];

  // Mock data based on screenshot
  const stations = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    description: i === 0 ? 'P' : i.toString(), // First row is P, then 1, 2, ...
  }));

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>MANAGE STATION <span className="header-subtitle">station details and more</span></h2>
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
              {stations.map((station, index) => (
                <tr key={index}>
                  <td className="col-id">{station.id}</td>
                  <td>{station.description}</td>
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

export default StationManagement;
