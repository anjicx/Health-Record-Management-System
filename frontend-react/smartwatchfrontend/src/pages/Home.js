import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { quotes } from "../utilities/quotes"; // Importuj citate
import "../style/home.css"; // Importuj CSS fajl

function Home() {
  const [quote, setQuote] = useState(quotes[0]);//prvi je startni citat

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
    }, 180000); // Menja citat na svakih pola sata
    return () => clearInterval(interval); // Čisti interval kada se komponenta makne s ekrana
  }, []);

  return (
    <div className="home-container">
      <h1>"{quote.text}"</h1> {/* dodavanje "" oko citata i ~ kod autora */}
      <p>~ {quote.author}~</p>

      <div className="buttons">
        <Link to="/login"><button className="btn">LOGIN</button></Link>
        <Link to="/register"><button className="btn">REGISTER</button></Link>
      </div>
     
    </div>
  );
}

export default Home;
