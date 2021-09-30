const express = require('express');

const router = express.Router();
const mysql = require('mysql2/promise');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { dbConfig, jwtSecret } = require('../../config');
const logger = require('../../logger');

const userSchema = Joi.object({
  full_name: Joi.string().min(5).trim(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(3).max(15).required(),
});

// Register post
router.post('/register', async (req, res) => {
  let userInput = req.body;
  try {
    userInput = await userSchema.validateAsync(userInput);
  } catch (err) {
    logger.error(err);
    return res.status(400).send({ err: 'Incorrect data passed' });
  }

  const encryptedPassword = bcrypt.hashSync(userInput.password);

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `INSERT INTO users3 (full_name,email,password) VALUES ('${userInput.full_name}','${userInput.email}', '${encryptedPassword}')`,
    );
    await con.end();
    return res.send(data);
  } catch (err) {
    if (err.errno === 1062) {
      logger.error(err);
      const errWords = err.sqlMessage.split(' ');
      const entry = errWords[2];
      const fieldDB = errWords[5];
      const formatField = fieldDB.split('.').slice(1);
      const format = formatField[0].slice(0, -1);
      console.log(`Duplicate entry - ${format}: ${entry}`);
      return res.status(400).send({ err: `Duplicate entry - ${format}: ${entry}` });
    }
    logger.error(err);
    return res.status(500).send({ err: 'Please try again' });
  }
});

// Login post
router.post('/login', async (req, res) => {
  let userInput = req.body;
  try {
    userInput = await userSchema.validateAsync(userInput);
  } catch (err) {
    logger.error(err);
    return res.status(400).send({ err: 'Incorrect email or password' });
  }

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`SELECT * FROM users3 WHERE email = '${userInput.email}' LIMIT 1`);
    await con.end();

    const answer = bcrypt.compareSync(userInput.password, data[0].password);

    const token = jwt.sign(
      {
        user_id: data[0].id,
        email: data[0].email,
      },
      jwtSecret,
    );

    return answer
      ? res.send({ msg: 'You have logged in successfully!', token })
      : res.status(400).send({ err: 'Incorrect email or password' });
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ err: 'Please try again' });
  }
});

module.exports = router;
