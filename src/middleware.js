const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

module.exports = {
  loggedIn: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, jwtSecret);
        req.userData = decodedToken;
        next();
    } else {
        res.sendStatus(401);
    }
  },
};
