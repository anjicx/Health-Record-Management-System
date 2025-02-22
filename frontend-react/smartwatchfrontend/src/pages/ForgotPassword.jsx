import { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = (e) => {
    e.preventDefault();
    alert("Ako postoji nalog sa ovom email adresom, poslat vam je link za resetovanje.");
  };

  return (
    <div>
      <h2>Zaboravljena lozinka</h2>
      <form onSubmit={handleReset}>
        <input type="email" placeholder="Unesite email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">Pošalji link za reset</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
