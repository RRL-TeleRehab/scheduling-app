const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendEmailWithNodemailer } = require("../helpers/email");

exports.signup = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  // check if account already exists
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "User already exists",
      });
    }
    // generate JWT Token
    const token = jwt.sign(
      { firstName, lastName, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "15m" }
    );

    // Email content to verify the account
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Account activation link`,
      html: `
        <p>Please use the following link to activate your account</p>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}/</p>
        `,
    };

    // send Email to the user
    sendEmailWithNodemailer(req, res, emailData);
  });
};

exports.accountActivation = (req, res, next) => {
  // get token
  const { token } = req.body;
  if (token) {
    // verify token
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          console.log("JWT ACCOUNT ACTIVATION ERROR", err);
          return res.status(401).json({
            error: "Expired link. Signup again",
          });
        }
        const { firstName, lastName, email, password } = jwt.decode(token);
        const user = new User({
          firstName,
          lastName,
          email,
          password,
        });
        // if token is correct and verifies, save the user record in the database
        user.save((err, user) => {
          if (err) {
            console.log("SAVE USER IN ACCOUNT ACTIVATION ERROR", err);
            return res.status(401).json({
              error: "Error saving user in database. Signup again",
            });
          }
          return res.json({
            message: "Signup success! Please SignIn",
          });
        });
      }
    );
  } else {
    return res.json({
      message: "Something went wrong. Try again",
    });
  }
};

exports.signin = (req, res, next) => {
  const { email, password } = req.body;
  // check if user exists in the database, exec method is provided by Mongo
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      console.log("User not found in database", err);
      return res.status(400).json({
        error: "User with that email does not exist, Please register.",
      });
    }

    // authenticate (validating password)
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match",
      });
    }

    // generate token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const { email, _id, firstName, lastName, role } = user;
    return res.json({
      token: token,
      user: { _id, firstName, lastName, email, role },
    });
  });
};

// Future work
// save all the emails in the database to keep track of them.
