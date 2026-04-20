import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  return (
    <div className="app-shell">
      {isAuthenticated ? (
        <Dashboard userEmail={userEmail} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
