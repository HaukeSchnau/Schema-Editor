import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { configure } from "mobx";
import App from "./App";
import { StoreProvider } from "../model/rootStore";

configure({
  enforceActions: "never",
});

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
