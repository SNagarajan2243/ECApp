const express = require('express')

// const {generateRandomPassword,checkPassword,login,checkUserExist} = require('./../Controllers/authController')

const {checkUserExist} = require('./../Controllers/authController')

const {createUserDetails,getUser,searchDonor,updateUserDetail,allUser,adminMemberApprovalHandler,profileImageHandler}  = require('./../Controllers/userController')

// const {joinClub,getJoinableClub,checkPriviledge,getRequestList,memberApprovalHandler} = require('./../Controllers/clubController')

const router = express.Router()

const multer = require('multer')

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

      cb(null, './images/profile');

    },
    filename: function (req, file, cb) {

      // Use a unique name for the uploaded file (e.g., timestamp + original file extension)
      const uniqueName = file.originalname;

      cb(null, uniqueName);

    },
});
  
const fileFilter = (req, file, cb) => {

    // Only accept image files (modify the MIME types as per your requirements)
    if (file.mimetype.startsWith('image/')) {

      cb(null, true);

    } else {
      // Reject a file (pass false) if it is not an image
      cb(null, false);
      
    }
};
  
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

// router.route('/signupemail').post(generateRandomPassword)

// router.route('/signuppassword').post(checkPassword)

// router.route('/login').post(login)

router.route('/user').get(checkUserExist,getUser).patch(createUserDetails)

router.route('/user/updateDetail').patch(checkUserExist,updateUserDetail)

// router.route('/club').get(checkUserExist,getJoinableClub).patch(checkUserExist,joinClub)

router.route('/donor').get(checkUserExist,searchDonor)

router.route('/request').get(checkUserExist,allUser)

router.route('/request/:id/:club').post(checkUserExist,adminMemberApprovalHandler)

router.route('/user/profileimage').patch(checkUserExist,upload.single('image'),(req,res,next)=>res.status(200).json({
    status: 'success',
    requestAt: req.requestTime,
    message: 'Profile Image Uploaded'
    })
)

router.route('/user/profileimagename').patch(checkUserExist,profileImageHandler)

// router.route('/request').get(checkUserExist,checkPriviledge,getRequestList)

// router.route('/request/:id/:club').post(checkUserExist,checkPriviledge,memberApprovalHandler)

module.exports = router

// router.route('/userdetails').patch(createUserDetails)

// router.route('/user/:id').get(checkUserExist,setId)

// router.route('/club').patch(checkUserExist,joinClub)
