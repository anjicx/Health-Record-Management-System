import { useEffect, useState, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// 3D model sa skaliranjem animacije
function HeartModel() {
  const { scene } = useGLTF("/a.glb");
  const modelRef = useRef();
  const [scale, setScale] = useState(2); // Početna skala

  // Animacija skaliranja modela
  useFrame(() => {
    // Povećavanje i smanjivanje modela
    const newScale = Math.sin(Date.now() * 0.001) * 0.5;
    setScale(newScale);
  });

  return (
    <primitive ref={modelRef} object={scene} scale={[scale, scale, scale]} />
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Učitavanje korisničkih podataka
  useEffect(() => {
    fetch("http://localhost:8000/api/user", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  // Ako podaci nisu učitani
  if (!user) return <p className="text-center mt-5">Loading...</p>;

  const profile = user.profile || {};

  // Funkcija za logout
  const handleLogout = () => {
    try {
      //throw new Error("Test error"); // za simulaciju greške
      localStorage.removeItem("token"); // Uklanja token iz localStorage
      setSuccessMessage("Logout successfull"); // Resetujemo prethodnu poruku
      setTimeout(() => {
        window.location.href = "/"; // Preusmerava korisnika na login stranicu nakon 2 sekunde
      }, 2000);
    } catch (error) {
      setErrorMessage("An error occurred while logging out. Please try again."); //ispis greške
      setSuccessMessage(""); // Resetuj poruku o uspehu
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center vh-100">
      {/* Sekcija za 3D model -prostor koji zauzima*/}
      <div style={{ width: "100%", height: "900px" }}>
        <Canvas>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} />
            <HeartModel />
            <OrbitControls />
          </Suspense>
        </Canvas>
      </div>

      {/* Sekcija za formu */}
      <div className="card shadow-lg p-4 mt-3" style={{ maxWidth: "400px" }}>
        <div className="card-body">
          <h1 className="card-title text-center mb-4">Health Profile</h1>
          {/* Poruke o odjavi */}
          {successMessage && (
            <div className="alert alert-success text-center">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="alert alert-danger text-center">{errorMessage}</div>
          )}

          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={profile.name || ""}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Surname</label>
            <input
              type="text"
              className="form-control"
              value={profile.surname || ""}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={user.username}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Age</label>
            <input
              type="text"
              className="form-control"
              value={profile.age || ""}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Height (cm)</label>
            <input
              type="text"
              className="form-control"
              value={profile.height || ""}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Weight (kg)</label>
            <input
              type="text"
              className="form-control"
              value={profile.weight || ""}
              readOnly
            />
          </div>
          <button className="btn btn-primary w-100 mt-3">Edit Profile</button>

          {/* Log Out */}
          <button onClick={handleLogout} className="btn btn-danger w-100 mt-3">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
