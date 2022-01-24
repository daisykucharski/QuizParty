import React from "react";

const ConfirmAnswer = ({
  handleCorrect,
  handleIncorrect,
}: {
  handleCorrect: () => void;
  handleIncorrect: () => void;
}) => {
  return (
    <>
      <button onClick={handleCorrect}>Answer is correct</button>
      <button onClick={handleIncorrect}>Answer is not correct</button>
    </>
  );
};

export default ConfirmAnswer;
