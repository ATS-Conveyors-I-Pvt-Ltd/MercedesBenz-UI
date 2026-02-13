import React, { useState, useEffect } from "react";
import { Network, Edit, Trash2, Plus } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../../constants";
import "./ShiftManagement.css";

const ShiftManagement = () => {
  const [activeTab, setActiveTab] = useState("Trim 4");
  const [shifts, setShifts] = useState([]);
  const [existingShiftNames, setExistingShiftNames] = useState([]); // NEW: for duplicate check
  const [editShift, setEditShift] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // backend or general error
  const [nameError, setNameError] = useState(""); // frontend duplicate error

  const tabs = [
    "Trim 4", "Trim 5", "Trim 6", "Mech 3",
    "Mech 4", "Mech 5", "Finish 1", "Finish 2"
  ];

  // =========================
  // Fetch all shifts
  // =========================
  const fetchShifts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/shifts`);
      setShifts(response.data);

      // store existing shift names for frontend duplicate check
      setExistingShiftNames(response.data.map(s => ({ name: s.shiftName.toLowerCase(), id: s.shiftId })));
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // =========================
  // Delete Shift
  // =========================
  const handleDelete = async (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await axios.delete(`${BASE_URL}/shifts/${shiftId}`);
        fetchShifts();
      } catch (error) {
        console.error("Error deleting shift:", error);
      }
    }
  };

  // =========================
  // Open Edit Popup
  // =========================
  const handleEdit = (shift) => {
    setEditShift({ ...shift });
    setIsAddMode(false);
    setErrorMessage("");
    setNameError("");
    setShowPopup(true);
  };

  // =========================
  // Open Add Popup
  // =========================
  const handleAdd = () => {
    setEditShift({
      shiftName: "",
      shiftDescription: "",
      shiftStartTime: "",
      shiftEndTime: "",
      breakfastStartTime: "",
      breakfastEndTime: "",
      lunchStartTime: "",
      lunchEndTime: "",
      snackStartTime: "",
      snackEndTime: "",
      dinnerStartTime: "",
      dinnerEndTime: "",
      shiftIsDeleted: 0
    });
    setIsAddMode(true);
    setErrorMessage("");
    setNameError("");
    setShowPopup(true);
  };

  const isAddFormValid = () => {
    if (!editShift) return false;

    return (
      editShift.shiftName.trim() !== "" &&
      editShift.shiftDescription.trim() !== "" &&
      editShift.shiftStartTime !== "" &&
      editShift.shiftEndTime !== "" &&
      editShift.breakfastStartTime !== "" &&
      editShift.breakfastEndTime !== "" &&
      editShift.lunchStartTime !== "" &&
      editShift.lunchEndTime !== "" &&
      editShift.snackStartTime !== "" &&
      editShift.snackEndTime !== "" &&
      editShift.dinnerStartTime !== "" &&
      editShift.dinnerEndTime !== "" &&
      nameError === "" // disable save if frontend duplicate exists
    );
  };

  // =========================
  // Input change handler
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditShift((prev) => ({ ...prev, [name]: value }));

    // Frontend duplicate validation for shiftName
    if (name === "shiftName") {
      const lowerVal = value.trim().toLowerCase();
      const duplicate = existingShiftNames.find(s => s.name === lowerVal && s.id !== (editShift?.shiftId || 0));
      setNameError(duplicate ? "Shift name already exists!" : "");
    }
  };

  // =========================
  // Save shift (Add or Edit)
  // =========================
  const handleSave = async () => {
    try {
      setErrorMessage("");

      if (isAddMode) {
        await axios.post(`${BASE_URL}/shifts`, editShift);
      } else {
        await axios.put(`${BASE_URL}/shifts/${editShift.shiftId}`, editShift);
      }

      setShowPopup(false);
      setEditShift(null);
      fetchShifts();

    } catch (error) {
      console.error("Error saving shift:", error);

      let msg = "Error saving shift. Please try again.";
      if (error.response) {
        const data = error.response.data;
        if (typeof data === "string") {
          msg = data;
        } else if (data && data.message) {
          msg = data.message;
        } else if (data && typeof data === "object") {
          msg = JSON.stringify(data);
        }
      } else if (error.message) {
        msg = error.message;
      }

      setErrorMessage(msg);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-title-section">
          <h2>
            MANAGE SHIFT <span className="header-subtitle">shift details and more</span>
          </h2>
        </div>
        <div className="header-brand">Mercedes-Benz India</div>
      </div>

      <div className="management-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <Network size={14} /> {tab}
          </button>
        ))}
        <button className="tab-button add" onClick={handleAdd}>
          <Plus size={14} /> Add Shift
        </button>
      </div>

      <div className="management-content">
        <div className="table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>SHIFT NAME</th>
                <th className="col-action">CPANEL</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan="3">No shifts available</td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.shiftId}>
                    <td className="col-id">{shift.shiftId}</td>
                    <td>{shift.shiftName}</td>
                    <td className="col-action">
                      <div className="action-btn-group">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(shift)}
                        >
                          <Edit className="action-icon" />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(shift.shiftId)}
                        >
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          Popup Form (Add/Edit)
      ========================= */}
      {showPopup && editShift && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>{isAddMode ? "Add Shift" : "Edit Shift"}</h3>

            {/* Frontend duplicate error */}
            {nameError && <div className="form-error">{nameError}</div>}

            {/* Backend/general error */}
            {errorMessage && <div className="form-error">{errorMessage}</div>}

            <form>
              <div className="form-row">
                <label>
                  Shift Name:
                  <input
                    type="text"
                    name="shiftName"
                    value={editShift.shiftName}
                    onChange={handleChange}
                    style={{ borderColor: nameError ? "red" : undefined }}
                  />
                </label>
                <label>
                  Description:
                  <input
                    type="text"
                    name="shiftDescription"
                    value={editShift.shiftDescription}
                    onChange={handleChange}
                  />
                </label>
              </div>

              {/* other input fields unchanged */}
              <div className="form-row">
                <label>
                  Start Time:
                  <input
                    type="time"
                    name="shiftStartTime"
                    value={editShift.shiftStartTime}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  End Time:
                  <input
                    type="time"
                    name="shiftEndTime"
                    value={editShift.shiftEndTime}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Breakfast Start:
                  <input
                    type="time"
                    name="breakfastStartTime"
                    value={editShift.breakfastStartTime}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Breakfast End:
                  <input
                    type="time"
                    name="breakfastEndTime"
                    value={editShift.breakfastEndTime}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Lunch Start:
                  <input
                    type="time"
                    name="lunchStartTime"
                    value={editShift.lunchStartTime}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Lunch End:
                  <input
                    type="time"
                    name="lunchEndTime"
                    value={editShift.lunchEndTime}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Snack Start:
                  <input
                    type="time"
                    name="snackStartTime"
                    value={editShift.snackStartTime}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Snack End:
                  <input
                    type="time"
                    name="snackEndTime"
                    value={editShift.snackEndTime}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Dinner Start:
                  <input
                    type="time"
                    name="dinnerStartTime"
                    value={editShift.dinnerStartTime}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Dinner End:
                  <input
                    type="time"
                    name="dinnerEndTime"
                    value={editShift.dinnerEndTime}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="popup-actions">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isAddFormValid()}
                >
                  {isAddMode ? "Add" : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setEditShift(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
