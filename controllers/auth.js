const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendEmailWithNodemailer } = require("../helpers/email");
const expressJWT = require("express-jwt");
const _ = require("lodash");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");

exports.signup = (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  // check if account already exists
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "User already exists",
      });
    }
    // generate JWT Token
    const token = jwt.sign(
      { firstName, lastName, email, password, role },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "15m" }
    );

    // Email content to verify the account
    const signUpMailTemplate = fs
      .readFileSync(
        path.join(__dirname, "../emailTemplates/signUp.html"),
        "utf8"
      )
      .toString();
    const singUpTemplate = handlebars.compile(signUpMailTemplate);
    const signUpMailContent = singUpTemplate({
      token: token,
      application_url: process.env.CLIENT_URL,
    });

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Thank you for choosing PROMOTE. Please find the account activation link`,
      html: signUpMailContent,
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
        const { firstName, lastName, email, password, role } =
          jwt.decode(token);
        const username =
          firstName.charAt(0).toUpperCase() +
          lastName +
          Math.floor(1000 + Math.random() * 1000);
        const user = new User({
          firstName,
          lastName,
          email,
          password,
          username,
          role,
        });
        // if token is correct and verifies, save the user record in the database
        user.save((err, user) => {
          if (err) {
            console.log("Save user in account activation error", err);
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
    const { email, _id, firstName, lastName, role, profilePhoto } = user;
    return res.status(200).json({
      token: token,
      user: { _id, firstName, lastName, email, role, profilePhoto },
    });
  });
};

exports.requireSignIn = expressJWT({
  secret: process.env.JWT_SECRET, //  this will make the middleware verify the token and attach the user to the request object
  // user data is available in token payload so we can use it in the middleware along with the request object
  algorithms: ["HS256"],
  // if the token is invalid, return error
});

// Admin Middleware used only for routes that should be accessible by only admin users
exports.adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        error: "Admin resource. Access denied",
      });
    }
    // this will add profile to the request object so we can use it in the next middleware
    req.profile = user;
    next();
  });
};

// Spoke Clinician Middleware used only for the routes that should be accessible by only Spoke Clinician users.
exports.spokeClinicianMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "spoke") {
      return res.status(400).json({
        error: "Resource access denied",
      });
    }
    req.profile = user;
    next();
  });
};

// Hub Clinician Middleware used only for the routes that should be accessible by only Hub Clinician users.

exports.hubClinicianMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "hub") {
      return res.status(400).json({
        error: "Resource access denied",
      });
    }
    req.profile = user;
    next();
  });
};

// Open Access Middleware used only for the routes that should be accessible all the user roles.
exports.userMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};

// function for forgot password where user provides an email address to send reset link to email address.
exports.forgotPassword = (req, res, next) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with the email does not exists",
      });
    }
    // generate JWT Token
    const token = jwt.sign(
      { _id: user._id, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: "15m",
      }
    );

    // Email content to verify the account
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password reset link`,
      html: `
        <p>Please use the following link to reset your password</p>
        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
        <hr/>
        <p>This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}/</p>
        `,
    };

    // update reset password link sent to email into DB
    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        console.log("RESET PASSWORD LINK ERROR");
        return res.status(400).json({
          error: "Database connection error on user forgot password request",
        });
      } else {
        // send Email to the user
        sendEmailWithNodemailer(req, res, emailData);
      }
    });
  });
};

// reset password with link sent to email
exports.resetPassword = (req, res, next) => {
  const { resetPasswordLink, newPassword, confirmNewPassword } = req.body;
  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(400).json({
            error: "Link has been expired. Please try again.",
          });
        }
        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(400).json({
              error: "Something went wrong try later.",
            });
          }
          if (newPassword || confirmNewPassword) {
            if (newPassword !== confirmNewPassword) {
              return res.status(400).json({
                error: "Passwords do not match",
              });
            } else {
              const updatedFields = {
                password: newPassword,
                resetPasswordLink: "",
              };
              user = _.extend(user, updatedFields);
              // save this user to the database
              user.save((err, results) => {
                if (err) {
                  return res.status(400).json({
                    error: "Error resetting user password. Please try again.",
                  });
                }
                res.json({
                  message:
                    "Great. Your password reset is successful. Login with new password",
                });
              });
            }
          }
        });
      }
    );
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res, next) => {
  const { idToken } = req.body;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      console.log("google login response", response);
      const { email_verified, given_name, family_name, picture, email } =
        response.payload;
      // check if the google user account email is verified or not
      if (email_verified) {
        // check if user with the same email already exists in the database
        User.findOne({ email }).exec((err, user) => {
          if (!user) {
            return res.status(400).json({
              error: "Account does not exist. Please register",
            });
          }
          // if user found
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { email, _id, firstName, lastName, role, profilePhoto } =
              user;
            return res.status(200).json({
              token: token,
              user: { _id, firstName, lastName, email, role, profilePhoto },
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed. Try again later.",
        });
      }
    });
};

exports.googleRegister = (req, res, next) => {
  const { idToken } = req.body;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      const { email_verified, given_name, family_name, picture, email } =
        response.payload;
      // check if the google user account email is verified or not
      if (email_verified) {
        // check if user with the same email already exists in the database
        User.findOne({ email }).exec((err, user) => {
          // if user found
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { email, _id, firstName, lastName, role, profilePhoto } =
              user;
            return res.status(200).json({
              token: token,
              user: { _id, firstName, lastName, email, role, profilePhoto },
            });
          }
          // if user not found
          else {
            // create a new user account
            let password = email + process.env.JWT_SECRET;
            let username =
              given_name.charAt(0).toUpperCase() +
              family_name +
              Math.floor(1000 + Math.random() * 1000);
            user = new User({
              firstName: given_name,
              lastName: family_name,
              password: password,
              email: email,
              username: username,
              profilePhoto: picture,
            });
            user.save((err, data) => {
              if (err) {
                console.log("Error google login on user save", err);
                return res.status(400).json({
                  error: "User signup failed with google",
                });
              }
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: "7d",
                }
              );
              const { email, _id, firstName, lastName, role, profilePhoto } =
                data;
              return res.status(200).json({
                token: token,
                user: { _id, firstName, lastName, email, role, profilePhoto },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed. Try again later.",
        });
      }
    });
};

// Future work
// save all the emails in the database to keep track of them.
