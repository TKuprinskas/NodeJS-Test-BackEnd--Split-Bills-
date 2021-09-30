const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { port } = require('./config');
const auth = require('./routes/v1/auth');
const accounts = require('./routes/v1/accounts');
const bills = require('./routes/v1/bills');
const groups = require('./routes/v1/groups');
const logger = require('./logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/v1/auth', auth);
app.use('/v1/accounts', accounts);
app.use('/v1/bills', bills);
app.use('/v1/groups', groups);

// GET - check server is running
app.get('/', (req, res) => {
  res.send({ msg: 'Server is running successfully' });
});

// GET - all other routes
app.all('*', (req, res) => {
  logger.warn(`Page not found: ${req.url}`);
  res.status(404).send({ msg: 'Page Not Found' });
});

app.listen(port, () => logger.info(`Server is running on port ${port}`));
