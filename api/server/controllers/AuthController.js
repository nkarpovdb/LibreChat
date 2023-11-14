const {
  registerUser,
  requestPasswordReset,
  resetPassword,
  setAuthTokens,
} = require('../services/AuthService');
const jose = require('jose');
const jwt = require('jsonwebtoken');
const Session = require('../../models/Session');
const User = require('../../models/User');
const crypto = require('crypto');
const cookies = require('cookie');

const registrationController = async (req, res) => {
  try {
    const response = await registerUser(req.body);
    if (response.status === 200) {
      const { status, user } = response;
      let newUser = await User.findOne({ _id: user._id });
      if (!newUser) {
        newUser = new User(user);
        await newUser.save();
      }
      const token = await setAuthTokens(user._id, res);
      res.setHeader('Authorization', `Bearer ${token}`);
      res.status(status).send({ user });
    } else {
      const { status, message } = response;
      res.status(status).send({ message });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

const getUserController = async (req, res) => {
  return res.status(200).send(req.user);
};

const resetPasswordRequestController = async (req, res) => {
  try {
    const resetService = await requestPasswordReset(req.body.email);
    if (resetService instanceof Error) {
      return res.status(400).json(resetService);
    } else {
      return res.status(200).json(resetService);
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e.message });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const resetPasswordService = await resetPassword(
      req.body.userId,
      req.body.token,
      req.body.password,
    );
    if (resetPasswordService instanceof Error) {
      return res.status(400).json(resetPasswordService);
    } else {
      return res.status(200).json(resetPasswordService);
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e.message });
  }
};

const refreshController = async (req, res) => {
  // Extract the JWT from the cookie
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['ws_id_token'];
  }

  if (!token) {
    return res.status(200).send('Refresh token not provided');
  }

  // Optional: Decode the token if you need to extract user info from it
  let decodedToken;
  try {
    decodedToken = jwt.decode(token); // Note: This does not verify the token
  } catch (err) {
    return res.status(200).send(err);
  }

  // Use the decoded token for user info
  const userInfo = decodedToken; // Or extract specific fields from decodedToken

  try {
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      // Create a new user instance
      user = new User({
        email: userInfo.email,
        name: userInfo.name,
      });

      // Save the user to the database
      await user.save();
    }

    //done(null, user);
    return res.status(200).send({ token, user: user.toJSON() });
  } catch (err) {
    return res.status(200).send(err);
  }
};

module.exports = {
  getUserController,
  refreshController,
  registrationController,
  resetPasswordRequestController,
  resetPasswordController,
};
