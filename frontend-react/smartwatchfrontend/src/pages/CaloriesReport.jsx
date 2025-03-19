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
  function groupDataDay(data) {
    const groupedData = {};

    data.forEach((item) => {
      const hour = new Date(item.timestamp * 1000).getUTCHours();
      const hourLabel = `${String(hour).padStart(2, "0")}h`;

      if (!groupedData[hourLabel]) {
        groupedData[hourLabel] = 0;
      }
      groupedData[hourLabel] += item.value;
    });

    const allHours = [];
    for (let i = 0; i < 24; i++) {
      allHours.push(`${String(i).padStart(2, "0")}h`);
    }

    return allHours.map((hourLabel) => ({
      label: hourLabel,
      value: groupedData[hourLabel] || 0,
    }));
  }
  function groupDataWeek(data) {
    const groupedData = {};
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Ponedeljak prvi
    const startOfWeek = dayjs(startDate).startOf("week").add(1, "day");

    data.forEach((item) => {
      const dayIndex = new Date(item.timestamp * 1000).getUTCDay();
      const correctedIndex = (dayIndex + 6) % 7;
      const dayLabel = daysOfWeek[correctedIndex];

      if (!groupedData[dayLabel]) groupedData[dayLabel] = 0;
      groupedData[dayLabel] += item.value;
    });

    return daysOfWeek.map((dayLabel, index) => ({
      label: `${dayLabel} (${startOfWeek.add(index, "day").format("DD.MM.")})`,
      value: groupedData[dayLabel] || 0,
    }));
  }
  function groupDataMonth(data, startDate) {
    const groupedData = {};
    const startOfMonth = dayjs(startDate).startOf("month");
    const daysInMonth = startOfMonth.daysInMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      groupedData[day] = 0;
    }

    data.forEach((item) => {
      //dani u mesecu
      const dayNumber = new Date(item.timestamp * 1000).getUTCDate();
      if (dayNumber >= 1 && dayNumber <= daysInMonth) {
        groupedData[dayNumber] += item.value;
      }
    });
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        label: ` ${startOfMonth.add(i, "day").format("DD.MM.")}`,
        value: groupedData[day] || 0,
      };
    });
  }

  //data koja se šalje za grafikon
  const processedData =
    period === "week"
      ? groupDataWeek(reportData) //za sedmicu
      : period === "month"
      ? groupDataMonth(reportData, startDate) //  za mesec
      : groupDataDay(reportData); //za dan

  const chartData = {
    labels: processedData.map((item) => item.label), //!!ISPIS NA X OSI
    datasets: [
      {
        label: "calories",
        data: processedData.map((item) => item.value),
        backgroundColor: "rgba(26, 144, 65, 0.7)",
        borderColor: "rgba(26, 144, 65, 1)",
        borderWidth: 1,
      },
    ],
  };
  //OVDE
  let totalCaloriesAggregated = 0;
  processedData.forEach((item) => {
    // računa za period ukupan broj koraka
    totalCaloriesAggregated += Number(item.value); // Konvertuje u broj da ne bude string negde PROBLEM ISPISA !!
  });

  // Računanje proseka u zavisnosti od perioda
  let displayText = "";
  if (period === "day") {
    displayText = "Sum: " + totalCaloriesAggregated;
  } else if (period === "week") {
    displayText = `Avg: ${(totalCaloriesAggregated / 7).toFixed(0)}`;
  } else if (period === "month") {
    const countDays = processedData.filter((item) => item.value > 0).length; //broj dana gde je br kor>0
    // Ako postoje dani sa podacima, računa se prosečna vrednost, u suprotnom 0
    displayText =
      countDays > 0
        ? `Avg: ${(totalCaloriesAggregated / countDays).toFixed(0)}`
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
