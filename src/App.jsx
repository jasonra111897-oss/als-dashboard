import React from "react";
import Dashboard from "./components/Dashboard";
// Do NOT import TopNavigation here to avoid the duplicated header

function App() {
  return (
    <div className="App">
      {/* The Dashboard now acts as the 'Parent'. 
        It will load the Excel data and pass it to the Navigation.
      */}
      <Dashboard />
    </div>
  );
}

export default App;