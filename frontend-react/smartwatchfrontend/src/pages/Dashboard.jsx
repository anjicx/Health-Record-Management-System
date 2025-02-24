import React from "react";
import "../style/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Kartice sa podacima */}

      <div className="info-card">
        <i className="fas fa-walking fa-3x text-primary"></i>
        <h4>Steps</h4>
        <p>10,500 / 20,000</p>
      </div>

      <div className="info-card">
        <i className="fas fa-fire-alt fa-3x text-danger"></i>
        <h4>Calories</h4>
        <p>2200 kcal</p>
      </div>

      <div className="info-card">
        <i className="fas fa-heartbeat fa-3x text-danger"></i>
        <h4>Heart Rate</h4>
        <p>72 bpm</p>
      </div>

      <div className="info-card">
        <i className="fas fa-bed fa-3x text-info"></i>
        <h4>Sleep</h4>
        <p>7h 30min</p>
      </div>

      <div className="info-card">
        <i className="fas fa-brain fa-3x text-warning"></i>
        <h4>Stress</h4>
        <p>Moderate</p>
      </div>

      <div className="info-card">
        <i className="fas fa-tint fa-3x text-primary"></i>
        <h4>Blood Pressure</h4>
        <p>120/80 mmHg</p>
      </div>
    </div>
  );
}

export default Dashboard;
