const nodemailer = require('nodemailer');

const pug = require('pug');

const { htmlToText } = require('html-to-text');
// new Email(user, url).sendWelcome();   .sendPasswordReset

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Patryk <${process.env.EMAIL_FROM}>`;
  }

  // it make very easy to make different transports for different needs / abstracting logic
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      // secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //Send the actual email
  async send(template, subject) {
    //1 ) Render HTML based on a pug template
    // res.render('')
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.first,
        url: this.url,
        subject,
      }
    );
    // 2) define email options

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: htmlToText(html), // TODO check if it working later - reason depreciated
      html,
    };

    // 3) create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  //only for send welcome
  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid only for 10 minutes'
    );
  }
};

// const sendEmail = async (options) => {
//   // 1) create a transporter - service which is going to send the email
//   // const transporter = nodemailer.createTransport({
//   //   // service: 'Gmail',
//   //   // auth: {
//   //   //   user: process.env.EMAIL_USERNAME,
//   //   //   pass: process.env.EMAIL.PASSWORD,
//   //   // },
//   //   // Activate in gmail "less secure app" option -> to check it out here
//   //   // we are not using gmail, because it is not best idea for production app
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   // secure: false,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   // });

//   // 2) define the email options
//   const mailOptions = {
//     from: 'Patryk <hello@patryk.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // we can compile it to html -> we will do it later
//   };

//   // 3) actually send the email with nodemailer
//   await transporter.sendMail(mailOptions);
// };

//default export
// module.exports = sendEmail;
