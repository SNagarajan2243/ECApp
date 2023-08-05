const express = require('express')

const {generateRandomPassword,checkPassword,login,checkUserExist} = require('../Controllers/authController')

const router = express.Router()

router.route('/signupemail').post(generateRandomPassword)

router.route('/signuppassword').post(checkPassword)

router.route('/login').post(login)

module.exports = router