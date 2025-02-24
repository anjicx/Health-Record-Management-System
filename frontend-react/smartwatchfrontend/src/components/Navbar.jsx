import React from "react";
import { Link } from "react-router-dom";
import "../style/navbar.css";

function NavBar() {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: "#4ab44a", padding: "5px 0" }}
    >
      <div className="container-fluid d-flex justify-content-between px-4">
        <Link
          className="nav-link text-white text-center small-link"
          to="/dashboard"
        >
          <i className="fas fa-heartbeat fa-lg"></i> {/* Health ikona */}
          <p>HEALTH</p>
        </Link>

        <Link
          className="nav-link text-white text-center small-link"
          to="/device"
        >
          <i className="fas fa-mobile-alt fa-lg"></i> {/* Device ikona */}
          <p>DEVICE</p>
        </Link>

        <Link
          className="nav-link text-white text-center small-link"
          to="/report"
        >
          <i className="fas fa-chart-line fa-lg"></i> {/* Report ikona */}
          <p>REPORT</p>
        </Link>

        <Link
          className="nav-link text-white text-center small-link"
          to="/profile"
        >
          <i className="fas fa-user fa-lg"></i> {/* Profile ikona */}
          <p>PROFILE</p>
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
