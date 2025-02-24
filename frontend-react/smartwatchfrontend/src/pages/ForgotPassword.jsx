import { useState } from "react"; //unos mejla i slanje na mejl za reset lozinke
import axios from "axios"; //komunikacija sa backendom
import "../style/forgotpassw.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); //dodate poruke i greška
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/forgot-password",
        { email }
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="main-container">
      <div className="forgot-password-container">
        <h2>Forgot Password?</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
