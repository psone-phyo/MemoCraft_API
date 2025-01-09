const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { body, matchedData, validationResult } = require("express-validator");
const User = require("../models/User.model");

router.post(
  "/register",
  body("name").notEmpty().withMessage("name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .custom(async (email) => {
      const takenEmail = await User.findOne({ email: email });
      if (takenEmail) {
        throw new Error("Email already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
    body('confirmPassword').custom((confirmPassword, {req})=>{
        if (confirmPassword !== req.body.password){
            throw new Error('Passwords do not match')
        }else{
            return true
        }
    }), 
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      await user.save();

      const Token = jwt.sign({ user }, process.env.ACCESS_KEY_SECRET, {
        expiresIn: "1h",
      });

      return res.status(201).json({
        Token: Token,
        message: "Registered Successfully",
      });
    }
  )

router.post(
  "/login",
  body("email").notEmpty().withMessage("Email is required"),
  body("password").custom(async (password) => {
    const hasPsw = await User.findOne({ password: password });
    if (!hasPsw) {
      throw new Error("Incorrect Password");
    }
  }),
  async (req, res) => {
    const errors = validationResult(req);
    const requiredEmail = errors.array().filter((e) => {
      if (e.msg === "Email is required") {
        return e;
      }
    });

    if (requiredEmail.length > 0) {
      return res.status(400).json({ errors: { email: "Email is required" } });
    }

    const checkEmail = await User.findOne({ email: req.body.email });
    if (!checkEmail) {
      return res
        .status(400)
        .json({ errors: { email: "Email does not Exist" } });
    }

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: { password: "Incorrect Password" } });
    }

    const user = await User.findOne({ email: req.body.email });
    const Token = jwt.sign({ user }, process.env.ACCESS_KEY_SECRET, {
      expiresIn: "5h",
    });
    return res.status(200).json({
      Token: Token,
      message: "Login Successful",
    });
  }
);

module.exports = router;
