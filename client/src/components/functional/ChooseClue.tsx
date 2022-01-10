import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { Clue, JeopardyCategory } from "../../types";

/**
 * Gives the player the ability to choose from the available categories and clues.
 * Once the player chooses both a category and a value, then an clueChosen event is
 * emitted
 * @param data the available clues and the socket to emit events with
 */
const ChooseClue = ({
  clues,
  socket,
  room,
}: {
  clues: JeopardyCategory[];
  socket: Socket;
  room: string;
}) => {
  console.log(clues);

  const [category, setCategory] = useState<JeopardyCategory | null>(null);
  const [question, setQuestion] = useState<Clue | null>(null);

  /**
   * Finds the categories that are available, (i.e. have unanswered questions)
   * @returns the available categories
   */
  const findAvailableCategories = (): JeopardyCategory[] => {
    return clues.filter((category) => isCategoryAvailable(category));
  };

  const isCategoryAvailable = (category: JeopardyCategory): boolean => {
    return category.questions.some((question) => question !== null);
  };

  /**
   * Finds the questions that have not been answered in the given category
   * @param id the category being searched
   */
  const findAvailableClues = (
    category: JeopardyCategory
  ): Array<Clue | null> => {
    // Find the questions that are not null
    return category.questions.filter((question) => question !== null);
  };

  // If the category hasn't been picked yet, have the user pick a category
  // If the category has been picked but the question hasn't, then have the user pick a value
  // If both the category and value have been picked, then the clueChosen event is transmitted
  if (!category) {
    const availableCategories = findAvailableCategories();
    return (
      <>
        {availableCategories.map((availableCategory) => {
          const { id, category } = availableCategory;
          return (
            <button
              className="clue-choose"
              key={id}
              onClick={() => setCategory(availableCategory)}
            >
              {category}
            </button>
          );
        })}
      </>
    );
  } else if (!question) {
    const availableClues = findAvailableClues(category);
    return (
      <>
        {availableClues.map((availableClue) => {
          if (!availableClue) {
            return <></>;
          }
          const { id, value } = availableClue;
          return (
            <button
              className="clue-choose"
              key={id}
              onClick={() => setQuestion(availableClue)}
            >
              {value}
            </button>
          );
        })}
      </>
    );
  } else {
    socket.emit("clueChosen", {
      room,
      categoryId: category.id,
      questionId: question.id,
    });
    return (
      <p>
        Chose {category.category} for {question.value}
      </p>
    );
  }
};

export default ChooseClue;
