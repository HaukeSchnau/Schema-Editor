import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { configure } from "mobx";
import Modal from "react-modal";
import App from "./App";
import { StoreProvider } from "../model/rootStore";

Modal.setAppElement("#__modal");

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
