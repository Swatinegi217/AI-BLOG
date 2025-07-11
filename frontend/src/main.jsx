import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Or App.css if that’s your global CSS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
