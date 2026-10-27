const User = require('../models/User');
const AppError = require('../utils/appError');
const { sendTokenResponse, getCookieOptions } = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, city } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 409));
    }

    // Role cannot be injected by client
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: 'customer',
      phone: phone ? phone.trim() : '',
      city: city ? city.trim() : 'New York',
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check for user and explicitly select passwordHash
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Log out user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
  const cookieOptions = getCookieOptions();
  res.cookie('jwt', 'loggedout', {
    ...cookieOptions,
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully',
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PATCH /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, avatar } = req.body;

    // Filter allowed fields
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (city !== undefined) updates.city = city.trim();
    if (avatar !== undefined) updates.avatar = avatar.trim();

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change user password
// @route   PATCH /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide both current and new password', 400));
    }

    if (newPassword !== confirmNewPassword) {
      return next(new AppError('New passwords do not match', 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters long', 400));
    }

    const user = await User.findById(req.user.id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.passwordHash = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
