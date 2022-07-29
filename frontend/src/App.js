import "./App.css";
import { Navbar } from "./components/Navbar";
import { Vedio } from "./components/Vedio";

import { Chat } from "./components/Chat";
import { AllRoute } from "./components/AllRoute";
import { useState } from "react";

function App() {
  return (
    <div className="appbg">
      <Navbar></Navbar>
      <AllRoute></AllRoute>
    </div>
  );
}

export default App;
