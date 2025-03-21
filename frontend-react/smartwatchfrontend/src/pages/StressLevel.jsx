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

const StressLevel = () => {
  const [reportData, setReportData] = useState([]);
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is not available");

      const response = await axios.get(
        `http://localhost:8000/api/stresslevel?period=${period}&startDate=${startDate}&field=stress_level`,
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
        label: "Stress Level",
        data: reportData.map((item) => (item.value > 0 ? item.value : null)),
        backgroundColor: "rgba(26, 144, 65, 0.2)",
        borderColor: reportData.map((item) =>
          item.value > 80 ? "red" : item.value < 40 ? "blue" : "green"
        ), // Crveno za visoke vrednosti, plavo za niske
        borderWidth: 1,
        pointRadius: 4,
        tension: 0.4, //  glatka linija-bez špiceva
        fill: true, // Omogućava popunjavanje ispod linije
      },
    ],
  };

  const totalHRAggregated = reportData.reduce(
    (sum, item) => sum + item.value,
    0
  );
  // Računanje proseka u zavisnosti od perioda
  let displayText = "";
  const totalEntries = reportData.length; // Ukupan broj grupisanih unosa

  const validEntries = reportData.filter((item) => item.value > 0).length; // Broj dana/grupa sa podacima
  displayText =
    validEntries > 0
      ? `Avg: ${(totalHRAggregated / validEntries).toFixed(0)}`
      : "Avg: 0";

  const chartOptions = {
    plugins: {
      legend: {
        display: false, // Isključuje prikaz legende
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
          callback: function (value, index, values) {
            if (period === "week") {
              return chartData.labels[index];
            } else if (period === "day") {
              const hour = parseInt(chartData.labels[index]);
              const formattedHour = String(hour).padStart(2, "0");
              return ["00", "06", "12", "18"].includes(formattedHour)
                ? `${formattedHour}h`
                : "";
            } else if (period === "month") {
              // Prikaz datuma samo za neke dane (svaki 5. dan)
              return index % 5 === 0 ? chartData.labels[index] : "";
            }
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Heart Rate",
        },
        beginAtZero: true,
        suggestedMax: 100,
      },
    },
    elements: {
      line: {
        fill: false, // Neće biti popunjen prostor ispod linije
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

      <div>
        <div className="mt-3 fw-bold fs-5">{displayText}</div>

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
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ height: "500px" }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StressLevel;
