const User = require('./../Models/userModel')

const Club = require('./../Models/clubModel')

const ClubUser = require('./../Models/clubUserModel')

const fs = require('fs')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')

const jwtDecrypt = (token) => jwt.verify(token,process.env.JWT_SECRET)

const checkImageAccess = (imgName) => {

    // console.log(imgName)

    return new Promise((resolve, reject) => {

        fs.access(`${__dirname}/../images/profile/${imgName}`, (err) => {
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

// const jwt = require('jsonwebtoken')

// const jwtToken = (id) => jwt.sign({id: id},process.env.JWT_SECRET,{
//     expiresIn: process.env.JWT_EXPIRES_IN
// })

exports.createUserDetails = async (req,res,next) => {

    console.log(req.body)

    const email = req.body.email

    const joiningYear = email.slice(0,2)

    const currentYear = new Date().getFullYear()%100
    
    const yearOfStudy = (currentYear-joiningYear)+1

    if(yearOfStudy>4){
        return res.status(400).json({
            status: 'fail',
            requestAt: req.requestTime,
            message: 'Your email id is Invalid'
        })
    }

    req.body.yearOfStudy = yearOfStudy

    req.body.password = await bcrypt.hash(req.body.password,12)

    req.body.passwordChangedAt = new Date().toISOString()

    // req.body.role = req.body.role.toLowerCase().slice(0,1).toUpperCase()+req.body.role.slice(1)

    // console.log(req.body)

    req.body.bloodDonor = req.body.bloodGroup? true: false

    req.body.bloodGroup = req.body.bloodDonor? req.body.bloodGroup: ""

    try{
        const user = await User.findOneAndUpdate({email},
            {
                password: req.body.password,
                department: req.body.department,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                passwordChangedAt: req.body.passwordChangedAt,
                phoneNo: req.body.phoneNo,
                yearOfStudy: req.body.yearOfStudy,
                bloodDonor: req.body.bloodDonor,
                bloodGroup: req.body.bloodGroup
            },{
                new: true,
                runValidators: true
            }
        )

        if(!user){  
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Correct Email'
            })
        }

        // const token = jwtToken(user.id)

        // const role = req.body.role

        // const club = await Club.create({userId,role})

        // if(!club){
        //     return res.status(400).json({
        //         status: 'fail',
        //         requestAt: req.requestTime,
        //         message: 'Something Went Wrong'
        //     })
        // }
        
        // const newUser = {...user,club: club.club,role: club.role,position: club.position}

        // console.log(newUser)

        // const clubUser = await ClubUser.create({userId: user._id})

        // console.log(clubUser)

        return res.status(201).json({
            status: 'success',
            requestAt: req.requestTime,
            // token,
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    department: user.department,
                    phoneNo: user.phoneNo,
                    yearOfStudy: user.yearOfStudy,
                    email: user.email,
                    bloodDonor: user.bloodDonor,
                    bloodGroup: user.bloodGroup,
                    // club: club.club,
                    // role: club.role,
                    // position: club.position
                }
            }
        })
    }
    catch(err){
        console.log(err)
        console.log('Error in Create User Detail Controller')
        return res.status(500).json({
            status: 'fail',
            requestAt: req.requestTime,
            message: err.name|| 'Error Found'
        })
    }

}

exports.getUser = async (req,res,next) => {

    try{

        // //-------------------------Check Token is present or not----------------------//

        // if(!req.headers.authorization.split(' ')[0]=== 'Bearer'){
        //     return res.status(400).json({
        //         status: 'fail',
        //         requestAt: req.requestTime,
        //         message: 'Please Provide Correct Token'
        //     })
        // }

        // //--------------------------Extract Token from header-------------------------//

        // const token = req.headers.authorization.split(' ')[1]

        // const userDetail = jwtDecrypt(token)

        // //-------------------------Extract id from token----------------------//
        
        // const id = userDetail.id

        // const user = await User.findById(id).select('-passwordChangedAt -password -__v')

        // //-------------------------Check User exist or not----------------------//

        // if(!user){  
        //     return res.status(400).json({
        //         status: 'fail',
        //         requestAt: req.requestTime,
        //         message: 'User Not Found'
        //     })
        // }

        const user = req.body.user

        return res.status(200).json({
            status: "success",
            requestAt: req.requestTime,
            data: {
                user
            }
        })

    }
    catch(err){
        console.log(err)
        console.log('Error in Get User Detail Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.name|| 'Error Found'
        })
    }
    
}

// exports.joinClub = async (req,res,next) => {

//     try{

//         if(!req.body.club){
//             return res.status(400).json({
//                 status: 'fail',
//                 requestAt: req.requestTime,
//                 message: 'Please Provide Club Name'
//             })
//         }

//         if(!Array.isArray(req.body.club)){
//             return res.status(400).json({
//                 status: 'fail',
//                 requestAt: req.requestTime,
//                 message: 'Please Provide Club Name in Array'
//             })
//         }
    
//         const club = req.body.user.club
    
//         club.push(...req.body.club)
    
//         const id = req.body.user._id
    
//         const updatedUser = await User.findByIdAndUpdate(id,{club}, {
//             new: true,
//             runValidators: true
//         })
    
//         if(!updatedUser){
//             return res.status(400).json({
//                 status: 'fail',
//                 requestAt: req.requestTime,
//                 message: 'Something Went Wrong'
//             })
//         }

//         return res.status(200).json({
//             status: 'success',
//             requestAt: req.requestTime,
//             data:{
//                 updatedUser
//             }
//         })
//     }
//     catch(err){
//         console.log(err)
//         console.log('Error in Join Club Controller')
//         return res.status(500).json({
//             status: 'error',
//             requestAt: req.requestTime,
//             message: err.name|| 'Error Found'
//         })
//     }
// }

exports.searchDonor = async (req,res,next) => {

    // console.log(req.query)

    try{

        let query = {...req.query}

        let user

        user = User.find({bloodDonor: true})

        //-----------------------Check Name is present or not----------------------//
        
        if(query.firstName){
        // if(query.firstName.regex){
            // let queryStr = JSON.stringify(query)
            // queryStr = queryStr.replace(/\b(regex)\b/g,match => `$${match}`)
            // user = user.find({firstName: {$regex: JSON.parse(queryStr).firstName['$regex']}})
            user = user.find({firstName: {$regex: query.firstName,$options: 'i'}})
        }
        //-----------------------Check Blood Group is present or not----------------------//
        
        if(query.bloodGroup){
            user = user.find({bloodGroup: query.bloodGroup})
        }

        //-----------------------Check Department is present or not----------------------//

        if(query.department){
            user = user.find({department: query.department})
        }
        
        //-----------------------Execute Query and Select Field----------------------//

        user = await user.sort({passwordChangedAt: -1}).select('-passwordChangedAt -password -__v -bloodDonor')

        user = user.map(singleUser => {
            
            if(singleUser.profileName){
                singleUser._doc.profileLink = `${req.protocol}://${req.get('host')}/${singleUser.profilePath}`
            }

            return singleUser
            
        })

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            result: user.length,
            data:{
                user
            }
        })

    }
    catch(err){
        console.log(err)
        console.log('Error in Search Donor Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.name|| 'Error Found'
        })
    }

}

exports.updateUserDetail = async (req,res,next) => {

    try{

        console.log(req.body)

        const {id: userId} = req.body.user

        const {firstName,lastName,phoneNo,department} = req.body.userDetail
    
        console.log(userId,firstName,lastName,phoneNo,department)
    
        //--------------------------check User exist or not-------------------------//
    
        const userDetail = await User.findByIdAndUpdate(userId,{
            firstName,
            lastName,
            phoneNo,
            department
        },{
            new: true,
            runValidators: true
        })
    
        if(!userDetail){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Something Went Wrong'
            })
        }

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            data:{
                user: {
                    firstName,
                    lastName,
                    phoneNo,
                    department
                }
            }
        })

    }
    catch(err){
        console.log(err)
        console.log('Error in Update User Detail Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.name|| 'Error Found'
        })
    }

}

exports.allUser = async (req,res,next) => {

    try{
        
        const {user} = req.body

        const email = user.email

        // console.log(user)

        // console.log(user.admin,user.email)

        if(!email.startsWith('mainadmin')){
            return res.status(403).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'You are not authorized to access this route'
            })
        }

        const users = await User.find({
            passwordChangedAt: {$ne: null}
        }).select('-__v')

        const clubUser = await ClubUser.find().select('-_id -__v')

        const clubs = await Club.find().select('-__v -_id')

        const eligibleToJoinAsAdminUsersList = await Promise.all(users.map(async(user) => {
            
            const clubUserAdminDetail = await ClubUser.find({userId: user._id,admin: true}).select('-__v -_id')

            const clubUserAdminIdDetail = clubUserAdminDetail.map(club => club.clubId)

            return ({
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                department: user.department,
                clubs:  clubs.filter(club => !clubUserAdminIdDetail.includes(club.clubId))
            }
        )}))
        // console.log(eligibleToJoinAsAdminUsersList)
        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            result: eligibleToJoinAsAdminUsersList.length,
            data: {
                eligibleToJoinAsAdminUsersList
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

exports.adminMemberApprovalHandler = async (req,res,next) => {

    try{

        const {id,club} = req.params

        if(!id || !club){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide User Id and Club Id'
            })
        }

        const {user,approvalStatus} = req.body

        console.log(user,approvalStatus)

        if(!user || approvalStatus===undefined){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide User and Approval Status'
            })
        }

        const email = user.email

        if(!email.startsWith('mainadmin')){
            return res.status(403).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'You are not authorized to access this route'
            })
        }

        if(approvalStatus===false){
            return res.status(200).json({
                status: 'success',
                requestAt: req.requestTime,
                message: 'User is not approved'
            })
        }

        const users = await User.findById(id)

        if(!users){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'User Not Found'
            })
        }

        // if(!user.admin){
        //     return res.status(403).json({
        //         status: 'fail',
        //         requestAt: req.requestTime,
        //         message: 'You are not authorized to access this route'
        //     })
        // }

        const clubUser = await ClubUser.findOne({userId: id,clubId: club})

        if(clubUser){
            
            if(clubUser.admin){
                return res.status(400).json({
                    status: 'fail',
                    requestAt: req.requestTime,
                    message: 'User is already an admin'
                })
            }
            else{
                clubUser.admin = true
                await clubUser.save()
                return res.status(200).json({
                    status: 'success',
                    requestAt: req.requestTime,
                    message: 'User is now an admin'
                })
            }
        }

        const newClubUser = await ClubUser.create({
            clubId: club,
            userId:id,
            admin: true,
            approvalStatus: 'Approved'
        })
        
        if(!newClubUser){
            return res.status(500).json({
                status: 'error',
                requestAt: req.requestTime,
                message: 'Something Went Wrong'
            })
        }

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            message: 'User is now an admin'
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

exports.profileImageHandler = async (req,res,next) => {

    try{

        // const {user} = req.body

        const token = req.headers.authorization.split(' ')[1]

        const {id} = jwtDecrypt(token)
        
        const user = await User.findById(id).select('-passwordChangedAt -password -__v')

        if(!req.body.originalname){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Original Image Name'
            })
        }

        const imgName = req.body.originalname

        console.log(req.body.originalname)

        // console.log(user.firstName)

        checkImageAccess(imgName)

        if(!user){

            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'User Not Found'
            })

        }


        user.profileName = imgName

        await user.save()
        
        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            message: 'Profile Image Uploaded'
        })

    }
    catch(err){

        fs.access(`${__dirname}/../images/profile/${req.body.originalname}`, (err) => {
            if (err) {
              return
            }
            // If the file exists, delete it
            fs.unlink(`${__dirname}/../images/profile/${req.body.originalname}`, (err) => {
                if (err) {
                    console.error('Error: Unable to delete the file.', err)
                } else {
                    console.log('File deleted successfully.')
                }
            })
        })

        console.log(err)
        console.log('Error in Profile Image Handler Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.name|| 'Error Found'
        })
    }

}