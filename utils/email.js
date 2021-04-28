const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter - service which is going to send the email
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL.PASSWORD,
    // },
    // Activate in gmail "less secure app" option -> to check it out here
    // we are not using gmail, because it is not best idea for production app
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) define the email options
  const mailOptions = {
    from: 'Patryk Nowak <hello@patryk.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // we can compile it to html -> we will do it later
  };

  // 3) actually send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

//default export
module.exports = sendEmail;
