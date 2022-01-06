import pool from "./db";
import { Clue, JeopardyCategory, FinalJeopardyClue, Clues } from "./types";

/**
 * Gets clues for the given round of Jeopardy!
 * @param round the number of which round of the game is happening
 * @param earliest_year the earliest year that  Jeopardy! questions could be pulled from
 * @returns a random set of clues
 * @throws error if round is not between 1 and 3
 */
export async function getClues(
  round: number,
  earliest_year: number
): Promise<Clues> {
  switch (round) {
    case 1:
      return await getRegularBoard("Jeopardy!", 200, earliest_year);
    case 2:
      return await getRegularBoard("Double Jeopardy!", 400, earliest_year);
    case 3:
      return await getFinalJeopardyQuestion(earliest_year);
    default:
      throw new Error(`Invalid round number ${round}`);
  }
}

/**
 * Gets a set of clues for Jeopardy! or Double Jeopardy! rounds
 * @param round_name The name of the round ("Jeopardy!" or "Double Jeopardy!")
 * @param starting_value The lowest value for each category of the given round
 * @param earliest_year the earliest year that  Jeopardy! questions could be pulled from
 * @returns a random set of clues
 */
async function getRegularBoard(
  round_name: string,
  starting_value: number,
  earliest_year: number
): Promise<JeopardyCategory[]> {
  try {
    const categoriesFromDB = await pool.query(
      "SELECT * FROM category WHERE round_name = $1 AND EXTRACT(YEAR FROM air_date) > $2 ORDER BY random() LIMIT 6",
      [round_name, earliest_year]
    );
    const selectedCategories = categoriesFromDB.rows;

    const board: JeopardyCategory[] = [];

    for (let i = 0; i < 6; i++) {
      const category = selectedCategories[i];
      const questionsSelected = await pool.query(
        // The data set does not contain the correct dollar values (in the case of a daily double, it shows what the player earned on that question
        // instead of what that question was originally worth). I could not figure out a clean way to reformat it in the database itself, so I
        // decided to just order it by appropiximate question value in this query and then manually add the values myself
        "SELECT question_id AS id, question, answer FROM question WHERE category_id = $1 ORDER BY CAST(REPLACE(SUBSTRING(question_value, 2), ',', '') as INT)",
        [category.category_id]
      );
      const questions = questionsSelected.rows;

      const questionsWithValues: Clue[] = [];

      for (let j = 1; j <= 5; j++) {
        const question = questions[j - 1];
        questionsWithValues.push({ ...question, value: j * starting_value });
      }

      board.push({
        id: category.category_id,
        category: category.category,
        questions: questionsWithValues,
      });
    }

    return board;
  } catch (error) {
    throw error;
  }
}

/**
 * Gets a clue for the Final Jeopardy! round
 * @param earliest_year the earliest year that  Jeopardy! questions could be pulled from
 * @returns a random clue
 */
async function getFinalJeopardyQuestion(
  earliest_year: number
): Promise<FinalJeopardyClue> {
  try {
    const categorySelected = await pool.query(
      "SELECT * FROM category WHERE round_name = 'Final Jeopardy!' AND EXTRACT(YEAR FROM air_date) > $1 ORDER BY random() LIMIT 1",
      [earliest_year]
    );
    const category = categorySelected.rows[0];

    const questionSelected = await pool.query(
      "SELECT question_id AS id, question, answer FROM question WHERE category_id = $1",
      [category.category_id]
    );
    const question = questionSelected.rows[0];

    return { category: category.category, ...question };
  } catch (error) {
    throw error;
  }
}
