import React from 'react';
import './Finish1Dashboard.css';

const Finish2 = () => {
  return (
    <div className="dashboard-container big-table-view">
      <table className="dashboard-table production-table">
        <thead>
          <tr>
            <th colSpan="4" className="table-main-title">Production Status for Finish 2 Line</th>
          </tr>
          <tr>
            <th className="column-header">SHIFT</th>
            <th className="column-header">TARGET</th>
            <th className="column-header">DUE</th>
            <th className="column-header">ACTUAL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="row-label">SHIFT 1</td>
            <td className="data-value green-text">0</td>
            <td className="data-value">0</td>
            <td className="data-value red-text">0</td>
          </tr>
          <tr>
            <td className="row-label">SHIFT 2</td>
            <td className="data-value green-text">0</td>
            <td className="data-value">0</td>
            <td className="data-value red-text">0</td>
          </tr>
        </tbody>
      </table>

      <div className="table-spacer"></div>

      <table className="dashboard-table time-table">
        <thead>
          <tr>
            <th className="column-header">TAKT (mm:ss)</th>
            <th className="column-header">Left Time</th>
            <th className="column-header">Lost Time (mm:ss)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="data-value big-value green-text">00:00</td>
            <td className="data-value big-value">19:20</td>
            <td className="data-value big-value red-text">00:00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Finish2;
