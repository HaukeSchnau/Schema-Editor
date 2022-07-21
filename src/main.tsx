import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { configure } from "mobx";
import Modal from "react-modal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import App from "./App";
import { StoreProvider } from "./model/rootStore";

Modal.setAppElement("#__modal");

configure({
  enforceActions: "never",
});

ReactDOM.render(
  <React.StrictMode>
    <StoreProvider>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
