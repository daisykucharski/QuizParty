const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

// middleware
app.use(cors());
app.use(express.json());

app.get("/jeopardy", async (req, res) => getNormalRound(res, "Jeopardy!", 0));

app.get("/jeopardy/:year", async (req, res) => {
    const { year } = req.params;
    getNormalRound(res, "Jeopardy!", year)
});

app.get("/doublejeopardy", async (req, res) => getNormalRound(res, "Double Jeopardy!", 0));

app.get("/doublejeopardy/:year", async (req, res) => {
  const { year } = req.params;
  getNormalRound(res, "Double Jeopardy!", year);
});

app.get("/finaljeopardy", async (req, res) =>
  getFinalJeopardyRound(res, 0)
);

app.get("/finaljeopardy/:year", async (req, res) => {
  const { year } = req.params;
  getFinalJeopardyRound(res, year);
});

// Responds to a requesut to get a given round type with the given earliest year
async function getNormalRound(res, round_name, earliest_year) {
  try {
    const selectedCategories = await pool.query(
      "SELECT * FROM category WHERE round_name = $1 AND EXTRACT(YEAR FROM air_date) > $2 ORDER BY random() LIMIT 6",
      [round_name, earliest_year]
    );

    const categoryRows = selectedCategories.rows;
    const result = [];

    for (i = 0; i < 5; i++) {
      const category = categoryRows[i];
      const categoryResult = { category: category.category };
      let questions = await pool.query(
        "SELECT question_value, question, answer FROM question WHERE category_id = $1",
        [category.category_id]
      );
      questions = questions.rows;
      categoryResult.questions = questions;
      result.push(categoryResult);
    }

    res.json({ categories: result });
  } catch (error) {
    console.error(error.message);
  }
}

// Responds to a request to get a final jeopardy round question with the given earliest year
async function getFinalJeopardyRound(res, earliest_year) {
  try {
    const selectedCategory = await pool.query(
      "SELECT * FROM category WHERE round_name = 'Final Jeopardy!' AND EXTRACT(YEAR FROM air_date) > $1 ORDER BY random() LIMIT 1",
      [earliest_year]
    );
    const category = selectedCategory.rows[0];
    const result = { category: category.category };
    const question = await pool.query(
      "SELECT question, answer FROM question WHERE category_id = $1",
      [category.category_id]
    );
    result.question = question.rows[0].question;
    result.answer = question.rows[0].answer;
    res.json(result);
  } catch (error) {
    console.error(error.message);
  }
}

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
