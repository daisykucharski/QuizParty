import React from "react";
import { JeopardyCategory } from "../../types";

interface CluesProps {
  clues: JeopardyCategory[];
}

function Board({ clues }: CluesProps) {
  return (
    <div className="board">
      {clues.map((column, index: number) => {
        const { category, questions } = column;

        return (
          <div className="category" key={index}>
            <div className="category-title">
              <p>{category}</p>
            </div>
            {questions.map((clue, index: number) => (
              <div className="clue" key={index}>
                <p>{clue ? `$${clue.value}` : ""}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default Board;
