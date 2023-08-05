const express = require('express')

// const {generateRandomPassword,checkPassword,login,checkUserExist} = require('./../Controllers/authController')

const {checkUserExist} = require('./../Controllers/authController')

const {createUserDetails,getUser,searchDonor,updateUserDetail,allUser,adminMemberApprovalHandler}  = require('./../Controllers/userController')

// const {joinClub,getJoinableClub,checkPriviledge,getRequestList,memberApprovalHandler} = require('./../Controllers/clubController')

const router = express.Router()

// router.route('/signupemail').post(generateRandomPassword)

// router.route('/signuppassword').post(checkPassword)

// router.route('/login').post(login)

router.route('/user').get(checkUserExist,getUser).patch(createUserDetails)

router.route('/user/updateDetail').patch(checkUserExist,updateUserDetail)

// router.route('/club').get(checkUserExist,getJoinableClub).patch(checkUserExist,joinClub)

router.route('/donor').get(checkUserExist,searchDonor)

router.route('/request').get(checkUserExist,allUser)

router.route('/request/:id/:club').post(checkUserExist,adminMemberApprovalHandler)

// router.route('/request').get(checkUserExist,checkPriviledge,getRequestList)

// router.route('/request/:id/:club').post(checkUserExist,checkPriviledge,memberApprovalHandler)

module.exports = router

// router.route('/userdetails').patch(createUserDetails)

// router.route('/user/:id').get(checkUserExist,setId)

// router.route('/club').patch(checkUserExist,joinClub)
