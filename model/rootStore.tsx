import React, { useContext } from "react";
import { useLocalObservable } from "mobx-react";
import { makeAutoObservable } from "mobx";
import Schema from "./schema";

export class RootStore {
  loadedSchema = new Schema();

  constructor() {
    makeAutoObservable(this);
  }
}

const StoreContext = React.createContext<RootStore | null>(null);

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider.");
  }

  return store;
};

export const StoreProvider: React.FC = ({ children }) => {
  const store = useLocalObservable(() => new RootStore());

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};
