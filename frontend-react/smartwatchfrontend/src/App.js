import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom"; // Pravilno importovanje
import './App.css';
import NavBar from "./components/Navbar";//komponenta navigacioni bar na svakoj stranici(sem)
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
      { location.pathname === "/dashboard" && <NavBar /> }
      <Routes>
        <Route path="/" element={<Login />} />{/* ako nema ništa znači početna stranica */}
        <Route path="/register" element={<Register />} />{/* ako nema ništa znači početna stranica */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default App;
