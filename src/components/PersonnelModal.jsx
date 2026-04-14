import React, { useState, useEffect } from "react";
import "./PersonnelModal.css";

const PersonnelModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({ 
    name: "", 
    position: "", 
    school: "",
    status: "Active" // Added to match the profile card
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({ name: "", position: "", school: "", status: "Active" });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content shadow-hover">
        <div className="modal-header">
           <h3>{editData ? "Update Personnel Info" : "Register New Personnel"}</h3>
           <p className="modal-subtitle">Ensure all DepEd records are accurate</p>
        </div>
        
        <div className="modal-inputs">
          <div className="input-field">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. BENJAMIN, BENJAMIN D." 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="input-field">
            <label>Position</label>
            <input 
              type="text" 
              placeholder="e.g. Teacher II" 
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
            />
          </div>

          <div className="input-field">
            <label>School Name</label>
            <input 
              type="text" 
              placeholder="Assign to a specific school" 
              value={formData.school}
              onChange={(e) => setFormData({...formData, school: e.target.value})}
            />
          </div>

          {/* New Status Selection to match */}
          <div className="input-field">
            <label>Employment Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Discard</button>
          <button className="save-btn" onClick={() => onSave(formData)}>
            {editData ? "Update Record" : "Save Personnel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonnelModal;