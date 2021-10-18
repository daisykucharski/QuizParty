CREATE DATABASE jeopardy;

CREATE TABLE staging (
    id SERIAL,
    show_number INT,
    air_date VARCHAR(30),
    round_name VARCHAR(30),
    category VARCHAR(200),
    question_value VARCHAR(10),
    question VARCHAR(1000),
    answer VARCHAR(300),
    PRIMARY KEY (id)
);

COPY staging(show_number, air_date, round_name, category, question_value, question, answer)
FROM "/data/uncleaned_data.csv"
DELIMITER ','
CSV HEADER;

-- Create a table with all of the show numbers and categories that contain questions with links to external media
CREATE TABLE media_categories AS
SELECT DISTINCT show_number, category
FROM staging
WHERE question LIKE '%<a href=%';


-- Delete all of the questions that are in categories containing media
DELETE FROM staging
WHERE id in (
    SELECT s.id
    FROM staging s, media_categories c
    WHERE s.show_number = c.show_number AND s.category = c.category

);

-- Create a table with all of the categories and show numbers of categories in non-Final Jeopardy rounds that do not contain exactly 5 questions
CREATE TABLE bad_categories AS
SELECT show_number, category, COUNT (question) 
FROM staging
WHERE round_name != 'Final Jeopardy!'
GROUP BY show_number, category
HAVING COUNT (question) != 5;

-- Delete all of the questions that are in categories without 5 questions
DELETE FROM staging
WHERE id in (
    SELECT s.id
    FROM staging s, bad_categories c
    WHERE s.show_number = c.show_number AND s.category = c.category

);

-- Create a table "Category" with SERIAL primary key category_id and air_date round_name and category fields as the distinct values of those fields from staging
CREATE TABLE category AS
SELECT DISTINCT air_date, round_name, category
FROM staging;

ALTER TABLE category ADD COLUMN category_id SERIAL PRIMARY KEY;

-- Create a table "Question" with SERIAL primary_key question_id and foreign key category_id. 
-- Will be same length as staging table and fk will be derived from the air-date and category

CREATE TABLE question AS
SELECT category_id, question_value, question, answer
FROM staging s INNER JOIN category c
ON s.air_date = c.air_date AND s.category = c.category;

ALTER TABLE question
ADD CONSTRAINT fk_category
FOREIGN KEY (category_id) 
REFERENCES category (category_id);

ALTER TABLE question ADD COLUMN question_id SERIAL PRIMARY KEY;

DROP TABLE staging;
DROP TABLE media_categories;
DROP TABLE bad_categories;