import React from "react";

function Board({ clues }) {
  return (
    <div className="board">
      {clues.map((category, index: number) => {
        const { name, clues } = category;

        return (
          <div className="category" key={index}>
            <div className="category-title">
              <p>{name}</p>
            </div>
            {clues.map((clue: number, index: number) => (
              <div className="clue" key={index}>
                <p>{clue ? `$${clue}` : ""}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default Board;
