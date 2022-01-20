import React, { useState } from "react";

const AnswerQuestion = ({
  onSubmit,
}: {
  onSubmit: (answer: string) => void;
}) => {
  const [answer, setAnswer] = useState("");

  return (
    <form>
      <input
        type="text"
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
        }}
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          onSubmit(answer);
        }}
      >
        Answer
      </button>
    </form>
  );
};

export default AnswerQuestion;
