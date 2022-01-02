import React from "react";

interface RoundProps {
  round: number;
}

function Header({ round }: RoundProps) {
  switch (round) {
    case 1:
      return <h1>Jeopardy!</h1>;
    case 2:
      return <h1>Double Jeopardy!</h1>;
    case 3:
      return <h1>Final Jeopardy!</h1>;
    default:
      return <h1>Loading clues</h1>;
  }
}

export default Header;
