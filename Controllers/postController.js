const fs = require('fs')

const User = require('./../Models/userModel')

const ClubUser = require('./../Models/clubUserModel')

const Club = require('./../Models/clubModel')

const Post = require('./../Models/postModel')

const checkImageAccess = (imgName) => {

    // console.log(imgName)

    return new Promise((resolve, reject) => {

        fs.access(`${__dirname}/../images/posts/${imgName}`, (err) => {
            if (err) {
                reject({
                    message: 'Image Not Provided or Not Saved'
                })
            } else {
                resolve()
            }

        })
    })
}

exports.createPost = async (req,res,next)=>{
    
    try{

        let postDetail = {}

        // console.log(req.body)

        const {caption,tags,modes,imgName,format,text,club,user: { firstName,lastName }} = req.body

        // await checkImageAccess(imgName)

        //-------------------------Check for required fields-------------------------//

        if(!caption || !tags || !format){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please provide caption, tags and format'
            })
        }

        //--------------------------Check for priviledge-----------------------------//

        if(!req.body.clubIdList.includes(req.body.club)){
            return res.status(403).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'You are not Authorized to create post for this club'
            })
        }

        //--------------------------Check for image----------------------------------//

        postDetail = {
            createdBy: `${firstName} ${lastName}`,
            clubId: club,
            caption,
            tags,
            format
        }

        //------------------Check Format is either image or text----------------//

        if(format.toLowerCase()!=='image' && format.toLowerCase()!=='text'){

            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please provide either image or text'
            })

        }

        if(format.toLowerCase()==='image' && imgName){

            //-------------------------Check for Image already exist or not-------------------------//

            await checkImageAccess(imgName)

            postDetail = {
                ...postDetail,
                imgName
            }

        }

        if(format.toLowerCase()==='text' && text.trim().length>0){

            postDetail = {
                ...postDetail,
                text
            }

        }

        //------------------Check for modes--------------------------------------//

        if(modes){

            postDetail = {
                ...postDetail,
                modes
            }

        }

        const newPost = await Post.create(postDetail)

        if(!newPost){
            return res.status(500).json({
                status: 'error',
                requestAt: req.requestTime,
                message: 'Something went wrong'
            })
        }

        return res.status(200).json({
            status: 'success',
            message: 'Post Created'
        })

    }
    catch(err){

        fs.access(`${__dirname}/../images/posts/${req.body.imgName}`, (err) => {
            if (err) {
              return
            }
            // If the file exists, delete it
            fs.unlink(`${__dirname}/../images/posts/${req.body.imgName}`, (err) => {
                if (err) {
                    console.error('Error: Unable to delete the file.', err)
                } else {
                    console.log('File deleted successfully.')
                }
            })
        })

        console.log(err)
        console.log(err.message)

        return res.status(500).json({
            status: 'fail',
            requestAt: req.requestTime,
            message: err.message
        })

    }

}

exports.appCreateImagePost = async (req,res,next)=>{

    console.log(req.headers)

    console.log(req.body)

    console.log(req.file)

    if(!req.file){
        return res.status(400).json({
            status: 'fail',
            requestAt: req.requestTime,
            message: 'Please provide image'
        })
    }
    
    return res.status(200).json({
        status: 'success',
        message: 'Post Created'
    })

}

exports.getPosts = async (req,res,next)=>{

    try{

        const clubId = req.query.clubId
    
        const {user,clubIdList} = req.body
    
        let posts
    
        // console.log(typeof clubId,clubId*1)
    
        if(!clubId){
    
            posts = Post.find().select('-__v').sort({ createdAt: -1 })
            
            if(clubIdList.length>0){
                posts.find({
                    $or: [
                      { modes: false },
                      {
                        $and: [
                          { clubId: { $in: clubIdList } },
                          { modes: true }
                        ]
                      }
                    ]
                })
                  
            }
            else{
                posts = posts.find({
                    modes: {
                        $ne: true
                    }
                })
            }
    
        }
        else{
    
            posts = Post.find({clubId}).select('-__v').sort({ createdAt: -1 })

            // console.log(clubId,clubIdList)
    
            if(!clubIdList.includes(clubId*1)){
                console.log('here')
                posts = posts.find({
                    modes: {
                        $ne: true
                    }
                })
            }
        }
    
        posts = await posts.find().catch(
            err => {
                console.log(err)
                console.log(err.message)
                return res.status(500).json({
                    status: 'error',
                    requestAt: req.requestTime,
                    message: err.message
                })
            }
        )

        const clubs = await Club.find().select('-__v')

        // console.log(posts)
        
        posts = posts.map(post => {
            if(post.format==='image'){
                image = `${req.protocol}://${req.get('host')}/${post.image}`
                post = {...post._doc,image}
            }
            else{
                post = {...post._doc}
            }

            const clubName = clubs.filter(club => club.clubId===post.clubId).map(club => club.clubName)[0]
            const clubLogoName = clubs.filter(club => club.clubId===post.clubId).map(club => club.image)[0]
            const clubLogo = `${req.protocol}://${req.get('host')}/${clubLogoName}`
            post = {...post,clubName,clubLogo}
            return post
        })
    
        // console.log(req.body.clubIdList)
    
        // console.log(posts)
    
        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            result: posts.length,
            data: {
                posts
            }
        })

    }
    catch(err){
        console.log(err)
        console.log(err.message)
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message
        })
    }


}

exports.addComment = async (req,res,next)=>{

    try{

            console.log(req.body)
            
            const {postId,comment,user: {_id,firstName,lastName}} = req.body
    
            if(!postId || !comment){
                return res.status(400).json({
                    status: 'fail',
                    requestAt: req.requestTime,
                    message: 'Please provide postId and comment'
                })
            }
    
            const post = await Post.findById(postId)
    
            if(!post){
                return res.status(404).json({
                    status: 'fail',
                    requestAt: req.requestTime,
                    message: 'No post found with this id'
                })
            }
    
            post.comments.push({
                comment,
                userId: _id,
                userName: `${firstName} ${lastName}`
            })
    
            await post.save()
    
            return res.status(200).json({
                status: 'success',
                requestAt: req.requestTime,
                data: {
                    user: {
                        userId: _id,
                        userName: `${firstName} ${lastName}`,
                        comment
                    }
                },
                message: 'Comment Added'
            })
    
    }
    catch(err){
        console.log(err)
        console.log(err.message)
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message
        })
    }

}

exports.addLikes = async (req,res,next) => {
    try{

        console.log(req.body.like)

        const likeAdded = 'Like Added'

        const likeRemoved = 'Like Removed'
            
        const {postId,like,user: {_id,firstName,lastName}} = req.body
    
        if(!postId || like===undefined){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please provide postId and like'
            })
        }


        let post

        if(like===true){
            post = await Post.findByIdAndUpdate(postId,{
                $inc: {
                    likes: 1
                }
            },{
                new: true,
                runValidators: true
            })
        }
        else{
            post = await Post.findByIdAndUpdate(postId,{
                $inc: {
                    likes: -1
                }
            },{
                new: true,
                runValidators: true
            })
        }

        const checkPostLike = await Post.findById(postId)

        if(checkPostLike.likes<0){
            post.likes = 0
            await post.save()
        }

        console.log(like?likeAdded:likeRemoved)

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            message: like ? likeAdded : likeRemoved
        })

    }
    catch(err){
        console.log(err)
        console.log(err.message)
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message
        })
    }
}
