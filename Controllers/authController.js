const User = require('./../Models/userModel')

const Clubs = require('./../Models/clubModel')

const ClubUser = require('./../Models/clubUserModel')

const {sendEmail} = require('./../utils/email')

const {sendForgotPasswordEmail} = require('./../utils/forgotpasswordemail')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')

const jwToken = (id) => jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_IN
}) 

const jwtDecrypt = (token) => jwt.verify(token,process.env.JWT_SECRET)

const jwTForPassword = (email) => jwt.sign({email},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_IN_FOR_PASSWORD
})

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

exports.checkUserExist = async (req,res,next) => {

    console.log(req.headers)

    try{
        
        //-------------------------Check Token is present or not----------------------//
        
        if(!req.headers.authorization || (req.headers.authorization.split(' ')[0].toLowerCase() !== 'bearer' || !req.headers.authorization.split(' ')[1])){
            return res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'INVALID_TOKEN or TOKEN_NOT_EXIST',
            })
        }

        //--------------------------Extract Token from header-------------------------//

        const token = req.headers.authorization.split(' ')[1]

        const userDetail = jwtDecrypt(token)

        //-------------------------Extract id from token----------------------//
        
        const id = userDetail.id

        const user = await User.findById(id).select('-passwordChangedAt -password -__v')

        //-------------------------Check User exist or not----------------------//

        if(!user){  
            return res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'User Not Found'
            })
        }

        console.log(user.profileName)

        if(user.profileName){
            user._doc.profileLink = `${req.protocol}://${req.get('host')}/${user.profilePath}`
        }
        
        req.body.user = user
    }
    catch(err){

        console.log(err)
        
        console.log('Error in Check User Exist Controller')
        if(err.name==='TokenExpiredError'){
            return res.status(301).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Token Expired'
            })
        }
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.name|| 'Error Found'
        })

    }
    
    next()
    
}

exports.generateRandomPassword = async (req,res,next) => {
    
    const randomNumber = getRandomNumber(1000, 9999);

    try{

        let newReq = {...req.body}
    
        newReq = {...newReq,password: randomNumber}

        //-------------------Check User with this email exist or not-----------------------//

        const checkUser = await User.find({email: newReq.email})

        if(checkUser.length>0){
            return res.status(400).json({
                status: 'fail',
                requestedAt: req.requestTime,
                message: 'User Already Registered'
            })
        }

        //-------------------Create User with this email-----------------------//
        
        const newUser = await User.create(newReq)

        if(newUser){

            //-------------------Send OTP to this email-----------------------// 

            await sendEmail(newUser.email,randomNumber,req.requestTime)

            return res.status(201).json({
                status: 'success',
                requestedAt: req.requestTime,
            })
        }
        else{
            return res.status(400).json({
                status: 'fail',
                requestedAt: req.requestTime,
                message: 'Not Registered Successfully'
            })
        }
    }
    catch(err){
        console.log(err.name,err.message)
        if(err.name==='MongoServerError' && err.code===11000){
            return res.status(500).json({
                status: 'error',
                requestedAt: req.requestTime,
                message: 'Email Already Exists',
                code: err.code
            })
        }
        if(err.name==='TypeError'){
            return res.status(500).json({
                status: 'error',
                requestedAt: req.requestTime,
                message: 'Error Found'
            })
        }
    }
    
}

exports.checkPassword = async (req,res,next) => {

    try{

        const {email,password} = req.body

        //-----check whether Email and Password are provided or not------// 

        if(!email || !password){
            return res.status(400).json({
                status: 'fail',
                requestedAt: req.requestTime,
                message: 'Please provide Email and secret password'
            })
        }

        //-------------check user exists with this mail---------------//

        const user = await User.find({email}).select('+password')

        if(!user){
            return res.status(400).json({
                status: 'fail',
                requestedAt: req.requestTime,
                message: 'Please Provide Correct Email'
            })
        }

        //-------------------compare password------------------------//

        const secretPassword = user[0].password

        const id = user[0]._id

        if(password==secretPassword){
            res.status(202).json({
                status:'success',
                requestAt: req.requestTime
            })
        }
        else{
            res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Correct Secret Password'
            })
        }
        
    }
    catch(err){
        console.log(err)
        console.log("Error in check password catch")
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: 'Error Found'
        })
    }
}

exports.login = async (req,res,next) => {
    
    try{

        const clubs = await Clubs.find().select('-__v -_id')
        
        const getClubName = (clubUserList) => clubs.filter(club => club.clubId===clubUserList.clubId).map(club => club.clubName)[0]
        
        //-------------------Check Email and Password exist or not-----------------------//
    
        const {email,password} = req.body
    
        if(!email || !password){
    
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Email and Password'
            })
    
        }
    
        // --------------------Check User exist------------------//
    
        const user = await User.findOne({email}).select('+password -__v')
        
        //-------------------Check they completed their registration process or not-----------------------//

        if(!user){
            return res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'No User Exist with this Email'
            })
        }

        if(!user.passwordChangedAt){
            return res.status(300).json({
                status: 'redirect',
                requestAt: req.requestTime,
                message: 'Complete user details first',
                code: 13
            })
        }
    
        const isPasswordCorrect = await user.correctPassword(password,user.password)

        //--------------------Check User exist and password is correct in mongodb------------------//
    
        if(!user || !isPasswordCorrect){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Correct Email and Password'
            })
        }
    
        const token = jwToken(user.id)
    
        user.password = undefined

        //----------------------Get Club User List----------------------//

        const clubUserLists = await ClubUser.find({userId: user.id,approvalStatus: 'Approved'}).select('-_id -userId -__v')

        const memberInClub = clubUserLists.filter(clubUserList => !clubUserList.admin && !clubUserList.committee).map(clubUserList => ({clubId: clubUserList.clubId,clubName: getClubName(clubUserList)}))

        const memberInClubCount = memberInClub.length

        const adminInClub = clubUserLists.filter(clubUserList => clubUserList.admin).map(clubUserList => ({clubId: clubUserList.clubId,clubName: getClubName(clubUserList)}))

        const adminInClubCount = adminInClub.length

        const committeeInClub = clubUserLists.filter(clubUserList => clubUserList.committee).map(clubUserList => ({clubId: clubUserList.clubId,clubName: getClubName(clubUserList)}))

        const committeeInClubCount = committeeInClub.length

        // console.log(clubs,clubUserLists)

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            token,
            data: {
                user,
                memberInClubCount,
                adminInClubCount,
                committeeInClubCount,
                memberInClub,
                adminInClub,
                committeeInClub,
                clubs
            }
        })
    
    }
    catch(err){
        console.log(err,"Error in login catch")
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message || 'Error Found'
        })
    }
    
}

exports.forgotPassword = async (req,res,next) => {

    try{

        const {requestTime,body: {email}} = req

        // const unixTimestamp = Math.floor(Date.now() / 1000)

        // console.log(unixTimestamp)

        if(!email){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Email'
            })
        }

        const user = await User.find({email,passwordChangedAt: {$exists: true}}).select('-__v')

        if(user.length===0){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'No User Exist with this Email or User not completed their registration process'
            })
        }

        const token = jwTForPassword(email)

        await sendForgotPasswordEmail(email,token,requestTime)

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            message: 'Check your email for reset password link'
        })

    }
    catch(err){
        console.log(err)
        console.log('Error in forgot password catch')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message || 'Error Found'
        })
    }

}

exports.checkLinkValidity = async (req,res,next) => {
    try{

        if(!req.headers.authorization || (req.headers.authorization.split(' ')[0].toLowerCase() !== 'bearer' || !req.headers.authorization.split(' ')[1])){
            return res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'INVALID_TOKEN or TOKEN_NOT_EXIST',
            })
        }

        const token = req.headers.authorization.split(' ')[1]

        const {email,iat,exp} = jwtDecrypt(token)

        console.log(email,iat,exp)

        if(!email || !iat || !exp){
            return res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'INVALID_TOKEN or TOKEN_NOT_EXIST',
            })
        }

        const user = await User.find({email})
        
        const iatTime = new Date(iat * 1000);

        const curTime = new Date()

        // Calculate the time difference in milliseconds
        const timeDifferenceInMilliseconds = curTime - iatTime;

        // Convert the time difference to minutes
        const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);

        if(timeDifferenceInMinutes>10){
            return res.status(403).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Link Expired'
            })
        }

        console.log(timeDifferenceInMinutes)

        if(user.length===0){
            return res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'No User Exist with this Email'
            })
        }

        const newToken = jwTForPassword(email)

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            newToken,
            message: 'Link is valid'
        })

    }
    catch(err){
        console.log(err)
        console.log('Error in check link validity catch')

        if(err.name==='TokenExpiredError')
            err.message = 'Link Expired'

        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message || 'Error Found'
        })
    }
}

exports.changePassword = async (req,res,next) => {

    try{

        if(!req.headers.authorization || (req.headers.authorization.split(' ')[0].toLowerCase() !== 'bearer' || !req.headers.authorization.split(' ')[1])){
            return res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'INVALID_TOKEN or TOKEN_NOT_EXIST',
            })
        }

        const token = req.headers.authorization.split(' ')[1]

        const {email,iat,exp} = jwtDecrypt(token)

        console.log(email,iat,exp)

        const {password} = req.body

        if(!password){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Password'
            })
        }

        console.log(password)

        if(!email || !iat || !exp){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'INVALID_TOKEN or TOKEN_NOT_EXIST',
            })
        }

        if(password.length<4){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Password length should be greater than 4'
            })
        }

        const user = await User.find({email,passwordChangedAt: {$exists: true}}).select('-__v')

        if(user.length===0){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'No User Exist with this Email or User not completed their registration process'
            })
        }

        // const iatTime = new Date(iat * 1000);

        // const curTime = new Date()

        // // Calculate the time difference in milliseconds
        // const timeDifferenceInMilliseconds = curTime - iatTime;

        // // Convert the time difference to minutes
        // const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);

        // if(timeDifferenceInMinutes>10){
        //     return res.status(403).json({
        //         status: 'fail',
        //         requestAt: req.requestTime,
        //         message: 'Link Expired'
        //     })
        // }

        const newPassword = await bcrypt.hash(req.body.password,12)

        const newPasswordChangedAt = Date.now()

        const newUpdate = await User.findByIdAndUpdate(user[0]._id,{password: newPassword,passwordChangedAt: newPasswordChangedAt})

        if(!newUpdate){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Password Not Changed'
            })
        }

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            message: 'Password Changed Successfully'
        })

    }
    catch(err){
        console.log(err)
        console.log('Error in change password catch')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message || 'Error Found'
        })
    }

}