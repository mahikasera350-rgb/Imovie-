const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'imovies_default_jwt_secret_dev_key_32bytes', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = getCookieOptions();

  res.cookie('jwt', token, cookieOptions);

  // Return clean user object without password
  const userData = user.toJSON ? user.toJSON() : user;

  res.status(statusCode).json({
    status: 'success',
    token, // Also return in body for client token storage if preferred
    data: {
      user: userData,
    },
  });
};

module.exports = {
  signToken,
  getCookieOptions,
  sendTokenResponse,
};
