const jwt = require('jsonwebtoken');

// typical middleware in NODE JS
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'secret_this_shold_be_longer');
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: `Auth failed! : ${error}` });
  }
};
