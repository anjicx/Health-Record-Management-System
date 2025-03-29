import { useEffect, useState, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// skaliranje animacije i 3d model
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
  const [isEditing, setIsEditing] = useState(false); //za edit mode praćenje
  const [profileData, setProfileData] = useState({
    //podaci korisnički praćenje
    name: "",
    surname: "",
    age: "",
    weight: "",
    height: "",
  });
  // Učitavanje korisničkih podataka
  useEffect(() => {
    fetch("http://localhost:8000/api/user", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setProfileData(data.profile || {});
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  // Ako podaci nisu učitani
  if (!user) return <p className="text-center mt-5">Loading...</p>;

  const profile = profileData;

  // da li je editovanje uradjeno
  const handleEditClick = () => {
    setIsEditing((prev) => !prev); // Omogućava prebacivanje između edit i view moda
  };

  // Funkcija za izmenu

  const handleInputChange = (e) => {
    const { name, value } = e.target; //ime polja i vr
    setProfileData((prevData) => ({
      //stara vr+izmenjena
      ...prevData,
      [name]: value,
    }));
  };
  const handleSaveChanges = () => {
    const requestData = { ...profileData };
    // Pretvori prazne stringove u null!
    Object.keys(requestData).forEach((key) => {
      if (requestData[key] === "") {
        requestData[key] = null;
      }
    });
    console.log("Slanje podataka na backend:", requestData); // Provera podataka

    fetch("http://localhost:8000/api/user", {
      method: "PATCH", // patch stavljen jer ne mora svaki deo da se menja(npr samo surname izmeniš)
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestData), //da od obj napravi json
    })
      .then(async (res) => {
        const data = await res.json();
        // console.log("Backend odgovor:", JSON.stringify(data, null, 2));
        if (!res.ok) {
          throw new Error(data.message || "Greška u zahtevu.");
        }
        setProfileData(data.user.profile || {}); // Ažuriramo podatke
        setSuccessMessage("Profile successfully updated!");
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Greška pri slanju podataka:", error);
        setErrorMessage("Error updating profile. Please try again.");
      });
  };

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
              name="name"
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Surname</label>
            <input
              type="text"
              className="form-control"
              name="surname"
              value={profile.surname || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Age</label>
            <input
              type="text"
              className="form-control"
              name="age"
              value={profile.age || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Height (cm)</label>
            <input
              type="text"
              className="form-control"
              name="height"
              value={profile.height || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Weight (kg)</label>
            <input
              type="text"
              className="form-control"
              name="weight"
              value={profile.weight || ""}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>
          <button
            onClick={handleEditClick}
            className="btn btn-primary w-100 mt-3"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>

          {isEditing && (
            <button
              onClick={handleSaveChanges}
              className="btn btn-success w-100 mt-3"
            >
              Save Changes
            </button>
          )}
          {/* Log Out */}
          <button onClick={handleLogout} className="btn btn-danger w-100 mt-3">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
