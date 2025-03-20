import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs"; // Za manipulaciju datumima

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const CaloriesReport = () => {
  const [reportData, setReportData] = useState([]);
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is not available");

      const response = await axios.get(
        `http://localhost:8000/api/caloriesreport?period=${period}&startDate=${startDate}&field=calories_burned`, //OVDE
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
  //napred
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
    labels: reportData.map((item) => item.label), //!!ISPIS NA X OSI
    datasets: [
      {
        label: "calories",
        data: reportData.map((item) => item.value),
        backgroundColor: "rgba(26, 144, 65, 0.7)",
        borderColor: "rgba(26, 144, 65, 1)",
        borderWidth: 1,
      },
    ],
  };
  //OVDE

  const totalCaloriesAggregated = reportData.reduce(
    (sum, item) => sum + item.value,
    0
  );
  // Računanje proseka u zavisnosti od perioda
  let displayText = "";
  const totalEntries = reportData.length; // Ukupan broj grupisanih unosa

  if (period === "day") {
    displayText = "Sum: " + totalCaloriesAggregated.toFixed(0);
    //RAČUNA NA OSNOVU PODATAKA KOJE IMA
    //da ne računa npr na 7dana a samo 3 dana sedmice su prošla
  } else if (period === "week" || period === "month") {
    const validEntries = reportData.filter((item) => item.value > 0).length; // Broj dana/grupa sa podacima
    displayText =
      validEntries > 0
        ? `Avg: ${(totalCaloriesAggregated / validEntries).toFixed(0)}`
        : "Avg: 0";
  }

  //uređivanje grafikona
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Bitno za bolji prikaz na tabletima-da ne menja po velićini koje će biti prikazane oznake
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
          autoSkip: false, // Sprečava Chart.js da sakriva oznake da bi prilagodio ekran
          callback: function (value, index, values) {
            if (period === "week") {
              return chartData.labels[index]; // Dani u nedelji
            } else if (period === "day") {
              const hour = parseInt(chartData.labels[index]); // "00h", "06h", "12h", "18h"
              const formattedHour = String(hour).padStart(2, "0"); // 0 -> "00", 6 -> "06"//da moraju 2
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
          text: "Calories", //OVDE
        },
        beginAtZero: true,
      },
    },
  };
  //jsx deo strukture komponenti
  return (
    //uređena dugmad-sa bootstrap klasama
    <div style={{ width: "90%", margin: "auto", textAlign: "center" }}>
      {/* glavni kontejner*/}

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

      {/* dugme nazad*/}
      <div>
        {/* AGREGACIJA PODATAKA */}
        <div className="mt-3 fw-bold fs-5">{displayText}</div>

        <div className="d-flex align-items-center justify-content-center my-3">
          <button
            className="btn btn-outline-secondary rounded-circle p-3 mx-2 shadow-sm"
            onClick={handlePrev}
          >
            <i className="bi bi-caret-left-fill fs-4"></i>
          </button>

          {/* prikazan datum*/}
          <span className="fw-bold fs-5 px-4 py-2 text-secondary bg-light rounded-pill shadow-sm">
            {dayjs(startDate).format(
              period === "day"
                ? "DD MMM YYYY" //za dan ceo datum
                : period === "week" //ako je week onda ide sedmica od datuma
                ? "Week of DD MMM"
                : "MMM YYYY" //ako mesec navodi se mesec i godina
            )}
          </span>

          {/* dugme napred*/}
          <button
            className="btn btn-outline-secondary rounded-circle p-3 mx-2 shadow-sm"
            onClick={handleNext}
          >
            <i className="bi bi-caret-right-fill fs-4"></i>
          </button>
        </div>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/*grafkon*/}
      <div style={{ height: "500px" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CaloriesReport;
