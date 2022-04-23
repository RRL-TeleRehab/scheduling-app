const nodemailer = require("nodemailer");

exports.sendEmailWithNodemailer = (req, res, emailData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_FROM || "everythinggenics@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "gvauuyoasuoezjie",
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      return res.json({
        message: `Email has been sent successfully. Follow the instructions in the email.`,
      });
    })
    .catch((err) => {
      console.log(`Problem sending email: ${err}`);
      return res.json({
        message: err.message,
      });
    });
};
