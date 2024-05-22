import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <div className="App">
      <h1>HTML GENERATOR</h1>
      <App />
    </div>
  </React.StrictMode>,
);
