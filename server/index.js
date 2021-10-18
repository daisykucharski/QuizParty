const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

// middleware
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const categories = await pool.query(
      "SELECT * FROM category WHERE round_name = 'Jeopardy!' ORDER BY random() LIMIT 5"
    );

    res.json(categories.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/jeopardy", async (req, res) => {
  try {
    // Get a random jeopardy round board from pool
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/jeopardy/:year", async (req, res) => {
  try {
    // Get a random jeopardy round board from pool where the year of the airdate is >= year
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/doublejeopardy", async (req, res) => {
  try {
    // Get a random double jeopardy round board from pool
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/doublejeopardy/:year", async (req, res) => {
  try {
    // Get a random double jeopardy round board from pool where the year of the airdate is >= year
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/finaljeopardy", async (req, res) => {
  try {
    // Get a random final jeopardy question from pool
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/finaljeopardy/:year", async (req, res) => {
  try {
    // Get a random final jeopardy round question  from pool where the year of the airdate is >= year
  } catch (error) {
    console.error(error.message);
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
