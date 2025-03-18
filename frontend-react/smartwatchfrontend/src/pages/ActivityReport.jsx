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
  //1.KUPRAVLJANJE STANJEM UNUTAR FUNKCIONALNIH KOMPONENTI
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
        //odabrani datum,period se šalje kao parametri
        `http://localhost:8000/api/activityreport?period=${period}&startDate=${startDate}`,
        {
          headers: {
            //mora da pošalje za proveru prijavlj korisnika
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      //ako je uspešno prošla autorizacija odgovor dobijeni su podaci od backenda i nema greške
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
  //5.DOBIJANJE SUMIRANIH PODATAKA NA STUBIĆU
  //grupisanje npr. od 23:00 do 23:59 je na jednom stubiću
  const groupDataByHour = (data) => {
    // Kreiramo prazan objekat za sumiranje podataka
    const groupedData = {};

    // Prolazimo kroz svaki podatak i sumiramo korake po satu
    data.forEach((item) => {
      //pretvaramo sate u ms da bi onda u utc,sa getutchours fjom izbegavamo greške sa offsetom-rešilo problme 00h
      const hour = new Date(item.timestamp * 1000).getUTCHours();
      const hourLabel = `${String(hour).padStart(2, "0")}h`; //sati dvocifr br npr 01h
      //ako nema ključ vrednost inicijalizuje se na 0
      if (!groupedData[hourLabel]) {
        groupedData[hourLabel] = 0;
      }
      //na to se dodaje vrednost koraka iz item.steps
      groupedData[hourLabel] += item.steps;
    });

    // Kreiramo niz svih sati (0h do 23h)
    const allHours = [];
    for (let i = 0; i < 24; i++) {
      allHours.push(`${String(i).padStart(2, "0")}h`);
    }

    // Za svaki sat, ako nema podatka, postavljamo vrednost 0
    //ključ vrrednost sat,broj koraka
    return allHours.map((hourLabel) => ({
      label: hourLabel,
      steps: groupedData[hourLabel] || 0,
    }));
  };

  //data koja se šalje za grafikon je ova proračunata
  const processedData = groupDataByHour(reportData);
  //grafikon podaci
  const chartData = {
    labels: processedData.map((item) => item.label),
    datasets: [
      {
        label: "Steps",
        data: processedData.map((item) => item.steps),
        backgroundColor: "rgba(26, 144, 65, 0.7)",
        borderColor: "rgba(26, 144, 65, 1)",
        borderWidth: 1,
      },
    ],
  };
  //uređivanje grafikona
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Bitno za bolji prikaz na tabletima-da ne menja po velićini koje će biti prikazane oznake
    scales: {
      x: {
        title: {
          display: true,
          text: period === "week" ? "Days" : "Time (Hours)",
        },
        ticks: {
          autoSkip: false, // Sprečava Chart.js da sakriva oznake da bi prilagodio ekran
          callback: function (value, index, values) {
            if (period === "week") {
              return chartData.labels[index]; // Dani u nedelji
            } else {
              const hour = parseInt(chartData.labels[index]); // "00h", "06h", "12h", "18h"
              const formattedHour = String(hour).padStart(2, "0"); // 0 -> "00", 6 -> "06"//da moraju 2
              return ["00", "06", "12", "18"].includes(formattedHour)
                ? `${formattedHour}h`
                : "";
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
