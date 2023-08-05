const express = require('express')

const { checkPriviledge,setClubIdList } = require('../Controllers/clubController')

const { checkUserExist } = require('../Controllers/authController')

const { createPost,appCreateImagePost,getPosts,addComment,addLikes,adminMemberApprovalHandler,allUser } = require('./../Controllers/postController')

const router = express.Router()

const multer = require('multer')

// const upload = multer({
//     dest: 'images/posts'
// })

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

      cb(null, 'images/posts');

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

router.route('/').post(checkUserExist,checkPriviledge,upload.single('image'),(req,res,next)=>res.status(200).json({
    status: 'success',
    requestAt: req.requestTime,
    message: 'Post Created'
  })
)

router.route('/appPost').post(appCreateImagePost)

router.route('/postDetail').post(checkUserExist,checkPriviledge,createPost)

router.route('/').get(checkUserExist,setClubIdList,getPosts)

router.route('/comments').post(checkUserExist,addComment)

router.route('/like').post(checkUserExist,addLikes)

module.exports = router