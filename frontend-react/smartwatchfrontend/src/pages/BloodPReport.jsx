import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const BloodPReport = () => {
  const [reportData, setReportData] = useState([]);
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is not available");

      const response = await axios.get(
        `http://localhost:8000/api/bloodp?period=${period}&startDate=${startDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setReportData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [period, startDate]);

  const handlePrev = () => {
    setStartDate((prev) =>
      period === "day"
        ? dayjs(prev).subtract(1, "day").format("YYYY-MM-DD")
        : period === "week"
        ? dayjs(prev).subtract(1, "week").format("YYYY-MM-DD")
        : dayjs(prev).subtract(1, "month").format("YYYY-MM-DD")
    );
  };

  const handleNext = () => {
    setStartDate((prev) =>
      period === "day"
        ? dayjs(prev).add(1, "day").format("YYYY-MM-DD")
        : period === "week"
        ? dayjs(prev).add(1, "week").format("YYYY-MM-DD")
        : dayjs(prev).add(1, "month").format("YYYY-MM-DD")
    );
  };

  const chartData = {
    labels: reportData.map((item) => item.label),
    datasets: [
      {
        label: "Systolic Pressure",
        data: reportData.map((item) =>
          item.systolic === 0 ? null : item.systolic
        ),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: false,
      },
      {
        label: "Diastolic Pressure",
        data: reportData.map((item) =>
          item.diastolic === 0 ? null : item.diastolic
        ),
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text:
            period === "week"
              ? "Days"
              : period === "month"
              ? "Date (Day of Month)"
              : "Time (Hours)",
        },
        ticks: {
          autoSkip: false,
          callback: function (value, index) {
            if (period === "week") {
              return reportData[index]?.label || "";
            } else if (period === "day") {
              return reportData[index]?.label || "";
            } else if (period === "month") {
              return reportData[index]?.label || "";
            }
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Blood Pressure (mmHg)",
        },
        suggestedMin: 40,
        suggestedMax: 180,
      },
    },
  };

  return (
    <div style={{ width: "90%", margin: "auto", textAlign: "center" }}>
      <div className="btn-group my-3">
        <button
          className={`btn ${
            period === "day" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setPeriod("day")}
        >
          D
        </button>
        <button
          className={`btn ${
            period === "week" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setPeriod("week")}
        >
          W
        </button>
        <button
          className={`btn ${
            period === "month" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setPeriod("month")}
        >
          M
        </button>
      </div>

      <div className="d-flex align-items-center justify-content-center my-3">
        <button
          className="btn btn-outline-secondary rounded-circle p-3 mx-2 shadow-sm"
          onClick={handlePrev}
        >
          <i className="bi bi-caret-left-fill fs-4"></i>
        </button>

        <span className="fw-bold fs-5 px-4 py-2 text-secondary bg-light rounded-pill shadow-sm">
          {dayjs(startDate).format(
            period === "day"
              ? "DD MMM YYYY"
              : period === "week"
              ? "Week of DD MMM"
              : "MMM YYYY"
          )}
        </span>

        <button
          className="btn btn-outline-secondary rounded-circle p-3 mx-2 shadow-sm"
          onClick={handleNext}
        >
          <i className="bi bi-caret-right-fill fs-4"></i>
        </button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ height: "500px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BloodPReport;
