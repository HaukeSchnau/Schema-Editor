import React from "react";
import { observer } from "mobx-react";

const Footer: React.FC = () => {
  return (
    <footer>
      <a href="https://haukeschnau.de">Eine Hauke Schnau Produktion</a>
    </footer>
  );
};

export default observer(Footer);
