import pool from "./db";

async function getBoard(round_name: string, starting_value: number, earliest_year: number) {
  try {
    const selectedCategories = await pool
      .query(
        "SELECT * FROM category WHERE round_name = $1 AND EXTRACT(YEAR FROM air_date) > $2 ORDER BY random() LIMIT 6",
        [round_name, earliest_year]
      )
      .then((resp) => resp.rows);

    const board = [];

    for (let i = 0; i < 6; i++) {
      const category = selectedCategories[i];
      const questions = await pool
        .query(
          // The data set does not contain the correct dollar values (in the case of a daily double, it shows what the player earned on that question
          // instead of what that question was originally worth). I could not figure out a clean way to reformat it in the database itself, so I
          // decided to just order it by appropiximate question value in this query and then manually add the values myself
          "SELECT question, answer FROM question WHERE category_id = $1 ORDER BY CAST(REPLACE(SUBSTRING(question_value, 2), ',', '') as INT)",
          [category.category_id]
        )
        .then((resp) => resp.rows);

      const questionsWithValues = [];

      for (let j = 1; j <= 5; j++) {
        const question = questions[j - 1];
        questionsWithValues.push({ ...question, value: j * starting_value });
      }

      board.push({
        category: category.category,
        questions: questionsWithValues,
      });
    }

    return board;
  } catch (error) {
    console.error(error.message);
  }
}

async function getFinalJeopardyQuestion(earliest_year:number) {
  try {
    const category = await pool
      .query(
        "SELECT * FROM category WHERE round_name = 'Final Jeopardy!' AND EXTRACT(YEAR FROM air_date) > $1 ORDER BY random() LIMIT 1",
        [earliest_year]
      )
      .then((resp) => resp.rows[0]);

    const question = await pool
      .query("SELECT question, answer FROM question WHERE category_id = $1", [
        category.category_id,
      ])
      .then((resp) => resp.rows[0]);

    return { category: category.category, ...question };
  } catch (error) {
    console.error(error.message);
  }
}