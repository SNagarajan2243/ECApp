// Import Nodemailer
const nodemailer = require('nodemailer')

const subject = 'Welcome to Tricky Trio Network'

const text = 'Welcome to Tricky Trio!'

let html = '<h1>Welcome to Tricky Trio!</h1><p>Here Your OTP is <b>%otp%</b> </p>'

const dotenv = require('dotenv')

dotenv.config({path: './config.dotenv'})

const transporter = nodemailer.createTransport({
  service: 'SendinBlue',
  auth: {
    user: process.env.SENDIN_BLUE_LOGIN_NAME,
    pass: process.env.SENDIN_BLUE_API_KEY,
  },
});

exports.sendEmail = async (to,otp,requestedTime) => {

  html = html.replace('%otp%',otp)

  const mailOptions = {
    from: `Trio Team <${process.env.EMAIL_FROM}>`, 
    to,                                            
    subject,                                       
    text,                                          
    html,                                          
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.log('Error sending email:', error);
    return res.status(500).json({
      status: 'error',
      requestedAt: requestedTime,
      message: 'Error sending email',
    });
  }
}
