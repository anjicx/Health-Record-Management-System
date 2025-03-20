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

const HeartRateReport = () => {
  const [reportData, setReportData] = useState([]);
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is not available");

      const response = await axios.get(
        `http://localhost:8000/api/activityreport?period=${period}&startDate=${startDate}&field=heart_rate`,
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

  // --- Dnevno grupisanje ---
  function groupDataDay(data) {
    const groupedData = {};
    const count = {};

    data.forEach((item) => {
      const hour = new Date(item.timestamp * 1000).getUTCHours();
      const hourLabel = `${String(hour).padStart(2, "0")}h`;

      if (!groupedData[hourLabel]) {
        groupedData[hourLabel] = 0;
        count[hourLabel] = 0;
      }
      groupedData[hourLabel] += item.value;
      count[hourLabel] += 1;
    });

    const allHours = [];
    for (let i = 0; i < 24; i++) {
      allHours.push(`${String(i).padStart(2, "0")}h`);
    }

    return allHours.map((hourLabel) => ({
      label: hourLabel,
      value: count[hourLabel] ? groupedData[hourLabel] / count[hourLabel] : 0,
    }));
  }

  // --- Sedmično grupisanje ---
  function groupDataWeek(data) {
    const groupedData = {};
    const count = {};
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    let totalSum = 0;
    let totalCount = 0;

    data.forEach((item) => {
      // Ako treba lokalno vreme, koristi getDay() umesto getUTCDay().
      const dayIndex = new Date(item.timestamp * 1000).getUTCDay();
      const correctedIndex = (dayIndex + 6) % 7;
      const dayLabel = daysOfWeek[correctedIndex];

      if (!groupedData[dayLabel]) {
        groupedData[dayLabel] = 0;
        count[dayLabel] = 0;
      }

      if (item.value > 0) {
        groupedData[dayLabel] += item.value;
        count[dayLabel] += 1;

        totalSum += item.value;
        totalCount += 1;
      }
    });

    const dailyAverages = daysOfWeek.map((dayLabel) => ({
      label: dayLabel,
      value: count[dayLabel] > 0 ? groupedData[dayLabel] / count[dayLabel] : 0,
    }));

    const overallAverage = totalCount > 0 ? totalSum / totalCount : 0;

    return { dailyAverages, overallAverage };
  }

  // --- Mesečno grupisanje ---
  function groupDataMonth(data, startDate) {
    const groupedData = {};
    const count = {};
    const startOfMonth = dayjs(startDate).startOf("month");
    const daysInMonth = startOfMonth.daysInMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      groupedData[day] = 0;
      count[day] = 0;
    }

    data.forEach((item) => {
      const dayNumber = new Date(item.timestamp * 1000).getUTCDate();
      if (dayNumber >= 1 && dayNumber <= daysInMonth) {
        groupedData[dayNumber] += item.value;
        count[dayNumber] += 1;
      }
    });

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        label: ` ${startOfMonth.add(i, "day").format("DD.MM.")}`,
        value: count[day] ? groupedData[day] / count[day] : 0,
      };
    });
  }

  // --- Odredi processedData i overallAverage ---
  let processedData = [];
  let overallAverage = 0;

  if (period === "week") {
    const { dailyAverages, overallAverage: weeklyAvg } =
      groupDataWeek(reportData);
    processedData = dailyAverages;
    overallAverage = weeklyAvg;
  } else if (period === "month") {
    processedData = groupDataMonth(reportData, startDate);
  } else {
    // day
    processedData = groupDataDay(reportData);
  }

  // --- Izračunaj displayText ---
  let displayText = "";
  if (period === "week") {
    // Za sedmicu koristimo overallAverage
    displayText = `Avg: ${overallAverage.toFixed(0)}`;
  } else {
    // Za day i month koristimo staru logiku
    let totalHeartRateAggregated = 0;
    processedData.forEach((item) => {
      totalHeartRateAggregated += Number(item.value);
    });
    const countT = processedData.filter((item) => item.value > 0).length;
    displayText =
      countT > 0
        ? `Avg: ${(totalHeartRateAggregated / countT).toFixed(0)}`
        : "Avg: 0";
  }

  // --- Chart data ---
  const chartData = {
    labels: processedData.map((item) => item.label),
    datasets: [
      {
        label: "Heart Rate",
        data: processedData.map((item) => item.value),
        backgroundColor: "rgba(26, 144, 65, 0.7)",
        borderColor: "rgba(26, 144, 65, 1)",
        borderWidth: 1,
      },
    ],
  };

  // --- Chart options ---
  const chartOptions = {
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

export default HeartRateReport;
