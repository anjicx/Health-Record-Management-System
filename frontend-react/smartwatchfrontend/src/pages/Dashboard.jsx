import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/dashboard.css";

function Dashboard() {
  const navigate = useNavigate(); //za navigaciju iym str

  const handleCardClick = (reportType) => {
    // Preusmeri na odgovarajući izveštaj
    navigate(`/${reportType}`);
  }; //preusmerava na navedenu stranicu
  const getSleepQuality = (percentage) => {
    if (percentage >= 85) return "Excellent";
    if (percentage >= 70) return "Good";
    if (percentage >= 50) return "Average";
    return "Poor";
  };

  const getStressLevel = (percentage) => {
    if (percentage < 20) return "Very Low";
    if (percentage < 40) return "Low";
    if (percentage < 60) return "Moderate";
    if (percentage < 80) return "High";
    return "Very High";
  };
  //početno ako ništa nije učitano
  const [data, setData] = useState({
    steps: 0,
    calories: 0,
    heart_rate: 0,
    sleep: 0,
    stress: 0,
    blood_pressure: { systolic: 0, diastolic: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token"); //mora isti naziv kao kod logina što prosleđuje
  const deviceId = localStorage.getItem("device_id"); // Preuzimanje ID uređaja

  useEffect(() => {
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }
    if (!deviceId) {
      setData({
        steps: "0",
        calories: "-",
        heart_rate: "-",
        sleep: "-",
        stress: "-",
        blood_pressure: { systolic: "-", diastolic: "-" },
      });
      //OVO IZMENITI OBAV UI DA BUDE alert("Please synch your device.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              device_id: deviceId, // Šalje ID uređaja API-ju
            },
          }
        );

        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, deviceId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      {/* Kartice sa podacima */}

      <div
        className="info-card"
        onClick={() => handleCardClick("activityreport")} //klikom na karticu /activityreport str nav
      >
        <i className="fas fa-walking fa-3x text-primary"></i>
        <h4>Steps</h4>
        <p>{data.steps} </p>
        <p>{(data.steps * 0.0008).toFixed(2)} km</p>
      </div>

      <div
        className="info-card"
        onClick={() => handleCardClick("caloriesreport")}
      >
        <i className="fas fa-fire-alt fa-3x text-danger"></i>
        <h4>Calories</h4>
        <p>{data.calories} kcal</p>
      </div>

      <div
        className="info-card"
        onClick={() => handleCardClick("heartratereport")}
      >
        <i className="fas fa-heartbeat fa-3x text-danger"></i>
        <h4>Heart Rate</h4>
        <p>{data.heart_rate} bpm</p>
      </div>

      <div
        className="info-card"
        onClick={() => handleCardClick("sleepqreport")}
      >
        <i className="fas fa-bed fa-3x text-info"></i>
        <h4>Sleep quality</h4>
        <p>{getSleepQuality(data.sleep)}</p>
      </div>

      <div className="info-card" onClick={() => handleCardClick("stresslevel")}>
        <i className="fas fa-brain fa-3x text-warning"></i>
        <h4>Stress level</h4>
        <p>{getStressLevel(data.stress)}</p>
      </div>

      <div className="info-card" onClick={() => handleCardClick("bloodp")}>
        <i className="fas fa-tint fa-3x text-primary"></i>
        <h4>Blood Pressure</h4>
        <p>
          {data.blood_pressure.systolic}/{data.blood_pressure.diastolic} mmHg
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
