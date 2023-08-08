const express = require('express')

const {generateRandomPassword,checkPassword,login,checkUserExist,forgotPassword,checkLinkValidity,changePassword,changePasswordWithOldPassword} = require('../Controllers/authController')

const router = express.Router()

router.route('/signupemail').post(generateRandomPassword)

router.route('/signuppassword').post(checkPassword)

router.route('/login').post(login)

router.route('/forgotpassword').get(checkLinkValidity).post(forgotPassword).patch(changePassword)

router.route('/changepassword').patch(checkUserExist,changePasswordWithOldPassword)

module.exports = router