import React from "react";

function Header({ round }) {
  switch (round) {
    case 1:
      return <h1>Jeopardy!</h1>;
    case 2:
      return <h1>Double Jeopardy!</h1>;
    case 3:
      return <h1>Final Jeopardy!</h1>;
    default:
      return <h1>Unknown round</h1>;
  }
}

export default Header;
