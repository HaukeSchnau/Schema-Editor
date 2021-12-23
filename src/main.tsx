import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Modal from "react-modal";
import { configure } from "mobx";
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
