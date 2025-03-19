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
  function groupDataDay(data) {
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
  }
  function groupDataWeek(data) {
    const groupedData = {};
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Ponedeljak prvi
    const startOfWeek = dayjs(startDate).startOf("week").add(1, "day");

    data.forEach((item) => {
      const dayIndex = new Date(item.timestamp * 1000).getUTCDay(); // Vraća 0 (Nedelja) do 6 (Subota)
      const correctedIndex = (dayIndex + 6) % 7; // Pomera Nedelju (0) na kraj
      const dayLabel = daysOfWeek[correctedIndex]; // Mapira u novi poredak-grafikon treba da počne od ponedeljka

      if (!groupedData[dayLabel]) groupedData[dayLabel] = 0; //ako ne postoji podataka postavi na 0 inicijalno
      groupedData[dayLabel] += item.steps; //ako postoji dodaj
    });

    return daysOfWeek.map((dayLabel, index) => ({
      label: `${dayLabel} (${startOfWeek.add(index, "day").format("DD.MM.")})`, // Formatirano npr. "Mon (11.03.)"
      steps: groupedData[dayLabel] || 0,
    }));
  }
  function groupDataMonth(data, startDate) {
    const groupedData = {};
    // Odredi početak meseca na osnovu startDate
    const startOfMonth = dayjs(startDate).startOf("month");
    // broj dana u mesecu na osnovu meseca fja
    const daysInMonth = startOfMonth.daysInMonth();

    // Inicijalizuj podatke svakog dana (1 do daysInMonth) na 0
    for (let day = 1; day <= daysInMonth; day++) {
      groupedData[day] = 0;
    }

    // Prođi kroz sve podatke (koji dolaze na svakih 1h)
    data.forEach((item) => {
      //dani u mesecu
      const dayNumber = new Date(item.timestamp * 1000).getUTCDate();
      if (dayNumber >= 1 && dayNumber <= daysInMonth) {
        groupedData[dayNumber] += item.steps; // Saberi korake za taj dan
      }
    });
    // Kreiraj niz objekata sa labelom (dan i datum) i sumiranim koracima
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1; // Dan u mesecu (1-indexed)
      return {
        label: ` ${startOfMonth.add(i, "day").format("DD.MM.")}`,
        steps: groupedData[day] || 0,
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
        label: "Steps",
        data: processedData.map((item) => item.steps),
        backgroundColor: "rgba(26, 144, 65, 0.7)",
        borderColor: "rgba(26, 144, 65, 1)",
        borderWidth: 1,
      },
    ],
  };
  if (!reportData || reportData.length === 0) {
    return <div>Loading...</div>; //KAD SE UČITAVA
  }

  let totalStepsAggregated = 0;
  processedData.forEach((item) => {
    totalStepsAggregated += Number(item.steps); // Konvertuje u broj da ne bude string negde PROBLEM ISPISA !!
  });

  // Računanje proseka u zavisnosti od perioda
  let displayText = "";
  if (period === "day") {
    displayText = "Sum: " + totalStepsAggregated;
  } else if (period === "week") {
    displayText = `Avg: ${(totalStepsAggregated / 7).toFixed(0)}`;
  } else if (period === "month") {
    // Broj jedinstvenih dana u mesecu
    const uniqueDaysCount = new Set(
      processedData.map((item) => new Date(item.timestamp * 1000).getUTCDate())
    ).size;
    displayText = `Avg: ${(
      totalStepsAggregated / (uniqueDaysCount || 1)
    ).toFixed(0)}`;
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
