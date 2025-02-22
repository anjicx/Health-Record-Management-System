import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom"; // Pravilno importovanje
import './App.css';
import NavBar from "./components/Navbar";//komponenta navigacioni bar na svakoj stranici(sem)
import Login from "./pages/Login";
function App() {
  return (
    <Router>
      <MainContent /> 
    </Router>
  );
}

//  nova komponentu  nalazi UNUTAR Router-a
function MainContent() {
  const location = useLocation(); //useLocation mora unutar Router zato izdvoljeno
  return (
    <>
      {location.pathname !== "/" && <NavBar />} {/* Sakrij NavBar na početnoj stranici */}
      <Routes>
        <Route path="/" element={<Login />} />{/* ako nema ništa znači početna stranica */}
      </Routes>
    </>
  );
}

export default App;
