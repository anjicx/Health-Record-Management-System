import React, {
  useState,
  useEffect,
} from "react"; /*useState je za promene stanja forme i greške a useEffect kod citata*/
import { useNavigate } from "react-router-dom"; /*za preusmeravanje nakon uspešne prijave */
import axios from "axios"; /*za Api zahteve poslate backendu */
import "../style/login.css";
import { quotes } from "../utilities/quotes"; // Importuj citate

const Login = () => {
  const [quote, setQuote] = useState(quotes[0]); //prvi je startni citat

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
    }, 3000); // Menja citat na svakih pola sata
    return () => clearInterval(interval); // Čisti interval kada se komponenta makne s ekrana
  }, []);

  const [formData, setFormData] = useState({
    /*formData čuvs vrednosti email i password polja,
    a za dinamičku izmenu unetih vrednosti polja služi setFormData */
    email: "" /*početne vrednosti-prazna polja*/,
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // čuva greške dobijene od backend-a

  const navigate = useNavigate(); //funkcija za preusmeravanje na drugu stranicu

  /*dinamično prati izmene na formi */
  function handleChange(e) {
    const { name, value } =
      /*name-password ili email polje, a value je uneta vrednost */
      e.target; /*target eventa je uneta nova šifra ili email*/
    setFormData((prevData) => ({
      /* postavlja izmenjene vrednosti formData zadržava neizmenjene */
      ...prevData /*čuva prethodno stanje */,
      /*postavlja izmenjenu vrednost polja */
      [name]:
        value /*menja deo koji je izmenjen-prvo kuca email menja se email,posle šifra */,
    }));
  }
  /*šalje login zahtev serveru i prima odgovor */
  const handleSubmit = async (e) => {
    e.preventDefault(); /*sprečava da se stranica reloaduje */
    setErrorMessage(""); // briše primljene prethodne greške pre nego uradi pošalje ponovo pod

    try {
      const response = await axios.post(
        /*sa axios.post šalje serveru zahtev sa podacima, 
        a await omogućava da nakon poslatog zahteva 
       sačeka odgovor pre nego nastaviš dalje */
        "http://127.0.0.1:8000/api/login" /*ruta na koju šalje */,
        formData /*uneti podaci koje šalje */
      );
      console.log(
        "Login successful:",
        response.data
      ); /*kada je odgovor servera primljen dostupan je response->data */
      localStorage.setItem("token", response.data.token); // Čuva token u localStorage!!!

      navigate(
        "/dashboard"
      ); /*preusmerava na novu stranicu nakon uspešne prijave */
    } catch (error) {
      /*ako se desi greška hvata je i ispisuje od servera dobijeni razlog greške. */
      console.error("Login error:", error.response?.data || error.message);

      // Prikaz greške
      if (error.response) {
        setErrorMessage(
          error.response.data.message || "An error occurred."
        ); /*greške ispis iz backenda */
      } else {
        setErrorMessage(
          "Server error. Please try again later."
        ); /*ispis greške ako nije pokrenut server */
      }
    }
  };

  return (
    <div className="login-container">
      <div className="quote-container">
        <h1>"{quote.text}"</h1>
        <p>~ {quote.author} ~</p>
      </div>

      <div className="login-card">
        {errorMessage && (
          <div className="alert alert-danger text-center">{errorMessage}</div>
        )}
        {/*prikaz kada je greška */}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              name="email"
              className="form-control p-2"
              placeholder="Enter email"
              value={formData.email} /*vrednost je formData definisana .email */
              onChange={
                handleChange
              } /*na izmeni vrednosti eventu se poziva se fja handleChange */
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              name="password"
              className="form-control p-2"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2">
            LOGIN
          </button>
        </form>
        <p className="register-text">
          Don't have an account? <a href="/register">Register here</a>
        </p>
        <p className="register-text">
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
