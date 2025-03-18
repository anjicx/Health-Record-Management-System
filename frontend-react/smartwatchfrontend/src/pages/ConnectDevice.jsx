import React, { useState } from "react";
import "../style/device.css";

function ConnectDevice() {
  const [devices, setDevices] = useState([]); // Lista uređaja
  const [selectedDeviceId, setSelectedDeviceId] = useState(null); // ID izabranog uređaja

  // Funkcija za dohvatanje 5 random uređaja iz API-ja
  const handleScanDevices = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/devices/random", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Token iz storage-a
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Unauthorized or API error");

      const data = await response.json();
      setDevices(data);
      setSelectedDeviceId(null); // Resetuj izbor uređaja
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };
  const handleSynchronize = async () => {
    if (!selectedDeviceId) {
      alert("Please select a device first.");
      return;
    }

    //console.log("Seletovanog uređaja ID:", selectedDeviceId);

    try {
      const response = await fetch(
        "http://localhost:8000/api/generate-health-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ device_id: selectedDeviceId }), //id uređaja šaljemo
        }
      );

      if (!response.ok) throw new Error("Failed to synchronize data");

      const result = await response.json();
      localStorage.setItem("device_id", selectedDeviceId); //postavlja zbog izveštaja dalje
      alert(result.message); // Prikaži poruku uspeha
    } catch (error) {
      console.error("Error syncing data:", error);
      alert("Failed to synchronize data.");
    }
  };

  return (
    <div className="device-container">
      <h2 className="device-title">CONNECT WITH YOUR DEVICE</h2>

      <div className="device-card">
        {/* Prikaz uređaja kao kartice */}
        <div className="device-grid">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`device-item ${
                selectedDeviceId === device.id ? "selected" : ""
              }`}
              onClick={() => setSelectedDeviceId(device.id)}
            >
              <p>{device.name}</p>
            </div>
          ))}
        </div>

        <div className="button-group">
          <button className="btn btn-one" onClick={handleScanDevices}>
            Scan devices
          </button>
          <button className="btn btn-two" onClick={handleSynchronize}>
            Synchronize
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectDevice;
