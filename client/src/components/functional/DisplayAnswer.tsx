import React from "react";

const DisplayAnswer = ({
  answer,
  playerAnswer,
  confirmAnswer,
}: {
  answer: string;
  playerAnswer: string;
  confirmAnswer: boolean;
}) => {
  return (
    <>
      <h1>The answer was {answer}</h1>
      {confirmAnswer ? <h2>Was {playerAnswer} correct?</h2> : ""}
    </>
  );
};

export default DisplayAnswer;
