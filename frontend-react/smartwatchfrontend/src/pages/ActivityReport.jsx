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
const ActivityReport = () => {
  //1.UPRAVLJANJE STANJEM UNUTAR FUNKCIONALNIH KOMPONENTI
  //setReportData fja da postavi data izveštaja-podatke dobijaš od backenda,default prazan niz
  const [reportData, setReportData] = useState([]);
  //postavi dan da je default za period-bira na frontu korisnik
  const [period, setPeriod] = useState("day");
  //postavi današnji datum za default za datum-bira na frontu korisnik
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  //postavi da nema greški-za obaveštenja u sl greške
  const [error, setError] = useState(null);

  //2.DOBIJANJE PODATAKA OD BACKENDA
  const fetchReportData = async () => {
    try {
      //pronađi token iz localStorage za sanctum autorizaciju(svugde ovako)
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is not available");

      const response = await axios.get(
        //odabrani datum,period se šalje kao parametri i grupisanje po periodu na back
        `http://localhost:8000/api/activityreport?period=${period}&startDate=${startDate}&field=steps`,
        {
          headers: {
            //mora da pošalje za proveru prijavlj korisnika
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      //ako je uspešno prošla autorizacija odgovor dobijeni su grupisani podaci od backenda i nema greške
      setReportData(response.data);
      setError(null);
    } catch (err) {
      //ako je neuspešno prošla autorizacija postavi grešku
      console.error("Error fetching data:", err);
      setError("Error fetching data. Please try again later.");
    }
  };

  //3.PONOVO UČITAVANJE PODATAKA KADA SE IZMENI PERIOD/DATUM ILI SE KOMP PONOVO UČITA
  useEffect(() => {
    fetchReportData();
  }, [period, startDate]);
  //4.LOGIKA POSTAVLJANJA DATUMA NAPRED/NAZAD STRELICA
  //unazad
  const handlePrev = () => {
    setStartDate(
      //početni datum postavi
      (prev) =>
        period === "day" //ako je dan oduzmi dan
          ? dayjs(prev).subtract(1, "day").format("YYYY-MM-DD")
          : period === "week" //ako je ned oduzmi ned
          ? dayjs(prev).subtract(1, "week").format("YYYY-MM-DD")
          : dayjs(prev).subtract(1, "month").format("YYYY-MM-DD") //ako nije dan/ned->mesec je->mesec oduzmi
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
        data: reportData.map((item) => item.value),
        //promena boje u odn na
        backgroundColor: reportData.map((item) =>
          item.value > 9999
            ? "rgba(99, 255, 104, 0.7)"
            : "rgba(54, 162, 235, 0.7)"
        ),
        borderColor: reportData.map((item) =>
          item.value > 9999 ? "rgb(104, 255, 99)" : "rgba(54, 162, 235, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const totalStepsAggregated = reportData.reduce(
    (sum, item) => sum + item.value,
    0
  );
  // Računanje proseka u zavisnosti od perioda
  let displayText = "";
  const totalEntries = reportData.length; // Ukupan broj grupisanih unosa

  if (period === "day") {
    displayText = "Sum: " + totalStepsAggregated;
  } else if (period === "week" || period === "month") {
    const validEntries = reportData.filter((item) => item.value > 0).length; // Broj dana/grupa sa podacima
    displayText =
      validEntries > 0
        ? `Avg: ${(totalStepsAggregated / validEntries).toFixed(0)}`
        : "Avg: 0";
  }

  //uređivanje grafikona
  const chartOptions = {
    animation: {
      duration: 1000,
      easing: "easeOutBounce",
    },
    plugins: {
      legend: {
        display: false, // Isključuje prikaz legende
      },
    },
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
          text: "Steps",
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

export default ActivityReport;
