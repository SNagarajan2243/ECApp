// Import Nodemailer
const nodemailer = require('nodemailer')

const subject = 'Forgot Password'

const text = 'Change Password Using the given Link in this email within 10 minutes'

const dotenv = require('dotenv')

dotenv.config({path: './config.dotenv'})

const transporter = nodemailer.createTransport({
  service: 'SendinBlue',
  auth: {
    user: process.env.SENDIN_BLUE_LOGIN_NAME,
    pass: process.env.SENDIN_BLUE_API_KEY,
  },
});

exports.sendForgotPasswordEmail = async (to,token,requestedTime) => {

  let html = `<h1>Click the Link</h1><br/>This link will be available for next 10 minutes.So Use this immediately Otherwise once again Click Forgot Password in the app or web.<br/><a href=http://localhost:3000/forgotpassword?verification=${token}>Change Password</a>`

  const mailOptions = {
    from: `Trio Team <${process.env.EMAIL_FROM}>`, 
    to,                                            
    subject,                                       
    text,                                          
    html                                          
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.response)
  } catch (error) {
    console.log('Error sending email:', error)
    return res.status(500).json({
      status: 'error',
      requestedAt: requestedTime,
      message: 'Error sending email',
    });
  }
}
