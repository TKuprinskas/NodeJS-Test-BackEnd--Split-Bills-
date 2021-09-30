const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

const { loggedIn } = require('../../middleware');
const { dbConfig } = require('../../config');
const logger = require('../../logger');

// POST - post new bill for specific group
router.post('/bills/:id', loggedIn, async (req, res) => {
  const { amount, description } = req.body;
  if (!amount || !description) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `INSERT INTO bills (group_id, amount, description) VALUES (${mysql.escape(req.params.id)}, ${mysql.escape(
      amount,
    )}, ${mysql.escape(description)}) `;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ err: 'Please try again' });
  }
});

// GET - get all bills for selected group
router.get('/bills/:id', loggedIn, async (req, res) => {
  const { id = '' } = req.params;
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `SELECT * FROM bills WHERE group_id = ${mysql.escape(id)}`;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ err: 'Please try again' });
  }
});

// GET - get all bills for selected group
router.get('/total/:id', loggedIn, async (req, res) => {
  const { id = '' } = req.params;
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `SELECT SUM(amount) as total FROM bills WHERE group_id = ${mysql.escape(id)} `;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ err: 'Please try again' });
  }
});

module.exports = router;
