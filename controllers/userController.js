const Users = require("../models/userModel");
const Payments = require("../models/paymentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await Users.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ msg: "The email address is already exists" });
      }
      if (password.length <= 5) {
        return res
          .status(400)
          .json({ msg: "password must be at least 6 characters" });
      }
      const passwordHash = await bcrypt.hash(password, 15);
      const newUser = new Users({ name, email, password: passwordHash });
      // database save
      await newUser.save();
      // Then create jsonwebtoken to authentication
      const accessToken = createAccessToken({ id: newUser._id });
      const refresh_Token = createRefreshToken({ id: newUser._id });

      res.cookie("refreshToken", refresh_Token, {
        httpOnly: true,
        path: "/user/refresh_token",
      });

      res.json({ accessToken });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect password." });
      }
      const accessToken = createAccessToken({ id: user._id });
      const refresh_Token = createRefreshToken({ id: user._id });

      res.cookie("refreshToken", refresh_Token, {
        httpOnly: true,
        path: "/user/refresh_token",
      });

      res.json({ accessToken });
    } catch (error) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: (req, res) => {
    try {
      // res.clearCookie("refreshToken", { path: "/user/refresh_token" });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        path: "/user/refresh_token",
      });
      return res.json({ msg: "Logged out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const ref_token = req.cookies.refresh_Token;
      if (!ref_token) {
        return res
          .status(400)
          .json({ msg: "Please Login or Register for refresh token" });
      }
      jwt.verify(ref_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
          return res
            .status(400)
            .json({ msg: "Please Login or Register for token verify" });
        }

        const accessToken = createAccessToken({ id: user.id });

        res.json({ accessToken });
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }
      res.json(user);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  addCart: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }
      await Users.findByIdAndUpdate(
        { _id: req.user.id },
        {
          cart: req.body.cart,
        }
      );
      return res.status(200).json({ msg: "Added to cart" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  history: async (req, res) => {
    try {
      const history = await Payments.find({ user_id: req.user.id });

      res.json(history);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = userCtrl;