"use client";

import React, { useState } from "react";
import "./App.css";
import LocationTracker from "./components/LocationTracker";

function App() {

  return (
    <div className="container">
      <LocationTracker />
    </div>
  );
}

export default App;
