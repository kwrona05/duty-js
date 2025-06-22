import { useState } from "react";
import "./Loggin.scss";

const USERNAME = "tester";
const PASSWORD = "oswiata.tester";

const LogginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === USERNAME && password === PASSWORD) {
      onLogin();
    } else {
      setError("Błędne dane logowania");
    }
  };

  return (
    <div className="login-screen">
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Zaloguj się</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default LogginScreen;
