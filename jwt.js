const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.User_Id, role: user.Role_Id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.User_Id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { generateAccessToken, generateRefreshToken };
