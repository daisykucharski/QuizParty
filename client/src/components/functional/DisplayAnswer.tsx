import React from "react";
import { Player } from "../../types";

const DisplayAnswer = ({
  answer,
  playerAnswer,
  answerer,
  answerStatus,
}: {
  answer: string;
  playerAnswer: string;
  answerer: Player;
  answerStatus: "noAnswer" | "correct" | "confirmAnswer";
}) => {
  switch (answerStatus) {
    case "noAnswer":
      return <h1>The answer was {answer}</h1>;
    case "correct":
      return (
        <>
          <h1>The answer was {answer}</h1>
          <h2>{answerer.name} was correct!</h2>
        </>
      );
    case "confirmAnswer":
      return (
        <>
          <h1>The answer was {answer}</h1>
          <h2>
            Was {answerer.name}'s answer of {playerAnswer} correct?
          </h2>
        </>
      );
    default:
      return <div></div>;
  }
};

export default DisplayAnswer;
