import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom"; // Pravilno importovanje
import './App.css';
import NavBar from "./components/Navbar";//komponenta navigacioni bar na svakoj stranici(sem)
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ConnectDevice from "./pages/ConnectDevice";
import ActivityReport from "./pages/ActivityReport";
import CaloriesReport from "./pages/CaloriesReport";
import HeartRateReport from "./pages/HeartRateReport";
import SleepQualityReport from "./pages/SleepQualityReport";
import Profile from "./pages/Profile";
import StressLevel from "./pages/StressLevel";


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

  
    const hideNavbarRoutes = ["/register","/", "/forgot-password", "/reset-password"];

return (
  <>
  

       {!hideNavbarRoutes.includes(location.pathname) && <NavBar />}
      <Routes>
        <Route path="/" element={<Login />} />{/* ako nema ništa znači početna stranica */}
        <Route path="/register" element={<Register />} />{/* ako nema ništa znači početna stranica */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/device" element={<ConnectDevice />} />
        <Route path="/activityreport" element={<ActivityReport />} />
        <Route path="/caloriesreport" element={<CaloriesReport />} />
        <Route path="/heartratereport" element={<HeartRateReport />} />
        <Route path="/sleepqreport" element={<SleepQualityReport />} />
        <Route path="/user" element={<Profile />} />
        <Route path="/stresslevel" element={<StressLevel />} />





      </Routes>
    </>
  );
}

export default App;
