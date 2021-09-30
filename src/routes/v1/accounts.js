const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

const { loggedIn } = require('../../middleware');
const { dbConfig } = require('../../config');
const logger = require('../../logger');

// GET - get account details
router.get('/accounts', loggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `SELECT a.user_id, a.group_id, g.name FROM accounts a LEFT JOIN groups1 g ON a.group_id = g.id WHERE a.user_id = ${mysql.escape(
      req.userData.user_id,
    )} GROUP BY a.user_id, a.group_id, g.name`;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ err: 'Please try again' });
  }
});

// POST - post new account
router.post('/accounts', loggedIn, async (req, res) => {
  const { groupID } = req.body;
  if (!groupID) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `INSERT INTO accounts (group_id, user_id) VALUES (${mysql.escape(groupID)},${mysql.escape(req.userData.user_id)})`;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ err: 'Please try again' });
  }
});

// DELETE - delete group from account
router.delete('/accounts/:id?', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(500).send({ msg: 'Incorrect request' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`DELETE FROM accounts WHERE group_id=${mysql.escape(id)} `);
    await con.end();
    return res.send(data);
  } catch (e) {
    return res.status(500).send({ msg: 'Please try again' });
  }
});

module.exports = router;
