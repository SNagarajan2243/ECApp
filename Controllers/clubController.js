const User = require('../Models/userModel') 

const Club = require('./../Models/clubModel')

const ClubUser = require('../Models/clubUserModel')

const Request = require('./../Models/requestModel')

// exports.findClubNameById = async (req,res,next) => {

//     const {clubs} = req.body

//     if(!clubs){
//         return res.status(400).json({
//             status: 'fail',
//             requestAt: req.requestTime,
//             message: 'Please Provide Club Name'
//         })
//     }

//     if(!Array.isArray(clubs)){
//         return res.status(400).json({
//             status: 'fail',
//             requestAt: req.requestTime,
//             message: 'Please Provide Club Name in Array'
//         })
//     }
     
//     let clubNameList = []

//     const clubDetails = await Club.find()
     
//     clubDetails.map(clubDetail=>{
//         clubs.map(club=>{
//             if(clubDetail.clubId === club){
//                 clubNameList.push(clubDetail.clubName)
//             }
//         })
//     })

//     req.body.clubNameList = clubNameList

//     next()
// }

exports.getJoinableClub = async (req,res,next) => {

    try{
        const userId = req.body.user._id

        console.log(userId)

        const clubUser = await ClubUser.find({userId}).select('-_id -userId -admin -committee -approvalStatus -__v')

        const userClubIdList = clubUser.map(club => club.clubId*1)

        console.log(userClubIdList)
        
        const clubs = await Club.find().select('-_id -__v')
        
        // const userClubList = clubs.filter(club => userClubIdList.includes(club.clubId)).map(club => club.clubName)

        const userNotJoinedClubList = clubs.filter(club => !userClubIdList.includes(club.clubId)).map(club=>({clubId: club.clubId,clubName: club.clubName}))
        
        // console.log(userClubList)

        // console.log(userNotJoinedClubList)
        
        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            result: userNotJoinedClubList.length,
            data: {
                // clubs,
                // userClubList,
                userNotJoinedClubList
            }
        })
    }
    catch(err){
        console.log(err)
        console.log('Error in Get Club User Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message|| 'Error Found'
        })
    }
}

// exports.joinClub = async (req,res,next) => {

//     try{

//         const {clubs,clubNameList,user:{firstName,lastName,email}} = req.body
        
//         const userId = req.body.user._id
        
//         const clubUserDetail = await ClubUser.findOne({userId})

//         if(!clubUserDetail){
//             return res.status(400).json({
//                 status: 'fail',
//                 requestAt: req.requestTime,
//                 message: 'Something Went Wrong'
//             })
//         }

//         const {status} = clubUserDetail
        
//         clubNameList.map(clubName=>{
//             status[clubName] = {
//                 ApprovalStatus: "Pending",
//                 Membership: "Member"
//             }
//         })

//         const updatedClubUser = await ClubUser.findOneAndUpdate({userId},{status},{
//             new: true,
//             runValidators: true
//         })

//         if(!updatedClubUser){
//             return res.status(400).json({
//                 status: 'fail',
//                 requestAt: req.requestTime,
//                 message: 'Something Went Wrong'
//             })
//         }
//         await Promise.all(clubs.map(async club=>{
//             const newRequest = await Request.create({
//                 userId,
//                 firstName,
//                 lastName,
//                 email,
//                 club
//             })
//             if(!newRequest){
//                 return res.status(400).json({
//                     status: 'fail',
//                     requestAt: req.requestTime,
//                     message: 'Something Went Wrong'
//                 })
//             }
//         }))
//         return res.status(200).json({
//             status: 'success',
//             requestAt: req.requestTime,
//             message: 'Request Sent Successfully'
//         })    
//     }
//     catch(err){
//         console.log(err)
//         console.log('Error in Join Club Controller')
//         return res.status(500).json({
//             status: 'error',
//             requestAt: req.requestTime,
//             message: err.message|| 'Error Found'
//         })
//     }

// }

exports.joinClub = async (req,res,next) => {
    
    try{

        const {clubs,user:{firstName,lastName,email,department,_id: userId}} = req.body

        console.log(typeof clubs,clubs,firstName,lastName,email,userId,department)

        
        //--------------------------------Check Club Array is Empty or not--------------------------------//

        if(clubs.length==0){
            return res.status(200).json({
                status: 'success',
                requestAt: req.requestTime,
                message: 'Request Sent Successfully'
            })
        }

        await Promise.all(clubs.map(async club=>{
            console.log(club)

            //--------------------------------Check Club Id Exist or not--------------------------------//

            const clubUserDetail = await ClubUser.findOne({clubId: club,userId})

            const clubRequestDetail = await Request.findOne({club,userId})

            //--------------------------------Create Club user using Club Id--------------------------------//
            if(!clubUserDetail){
                const newClubUser = await ClubUser.create({
                    clubId: club,
                    userId
                })
                console.log("newClubUser was created")
    
                if(!newClubUser){
                    return res.status(400).json({
                        status: 'fail',
                        requestAt: req.requestTime,
                        message: 'Something Went Wrong in Club User'
                    })
                }
            }

            //--------------------------------Create Request using Club Id Once Club User creation get Successfull--------------------------------//

            if(!clubUserDetail && !clubRequestDetail){
                const newRequest = await Request.create({
                    userId,
                    firstName,
                    lastName,
                    email,
                    department,
                    club
                })

                console.log("newRequest was created")
    
                if(!newRequest){
                    return res.status(400).json({
                        status: 'fail',
                        requestAt: req.requestTime,
                        message: 'Something Went Wrong  in Request'
                    })
                }
            }

        }))

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            message: 'Request Sent Successfully'
        })

    }
    catch(err){
        console.log(err)
        console.log('Error in Join Club Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message|| 'Error Found'
        })
    }

}

exports.checkPriviledge = async (req,res,next) => {
    
    const {user: {_id : userId},clubs} = req.body

    try{

        let clubIdList = []

        // const clubUser = await ClubUser.find({userId}).select('-_id -userId -__v')
        
        if(clubs){
            
            const priviledgeClubIdList = clubs.map(club => club.clubId*1)

            const clubUser = await ClubUser.find({userId,clubId: {$in: priviledgeClubIdList},
                $or: [
                { admin: true },
                { committee: true }
            ]}).select('-_id -userId -__v')
            
            const clubUserIdList = clubUser.map(club => club.clubId*1)
            
            clubIdList = priviledgeClubIdList.filter(clubId => clubUserIdList.includes(clubId))
            
        }
        else{

            const clubUser = await ClubUser.find({userId,
                $or: [
                { admin: true },
                { committee: true }
            ]}).select('-_id -userId -__v')
            
            clubIdList = clubUser.map(club => club.clubId*1)

            const clubs = await Club.find({clubId: {$in: clubIdList}})

            req.body.clubs = clubs.filter(club => clubIdList.includes(club.clubId)).map(club => ({clubId: club.clubId,clubName: club.clubName}))
        }

        if(clubIdList.length===0){
            return res.status(401).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'You are not authorized'
            })
        }

        req.body.clubIdList = clubIdList

    }   
    catch(err){
        console.log(err)
        console.log('Error in Check Priviledge Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message|| 'Error Found'
        })
    }
    
    next()

}

exports.getRequestList = async (req,res,next) => {
    
    try{

        // if(!req.body.clubs || req.body.clubs.length===0){
        //     return res.status(400).json({
        //         status: 'fail',
        //         requestAt: req.requestTime,
        //         message: 'Please Provide Club Name'
        //     })
        // }
    
        const { clubs,clubIdList } = req.body

        console.log(clubs,clubIdList)

        // const [clubName] = req.body.clubNameList
        
        // const [{clubId}] = await Club.find({clubName}).select('-_id -__v -president -vicePresident -secretary -treasurer -Admin')

        // const requestList = await Request.find({club: clubId,status: 'Pending'}).select('-_id -__v -club')

        // return res.status(200).json({
        //     status: 'success',
        //     requestAt: req.requestTime,
        //     result: requestList.length,
        //     data: {
        //         users: requestList
        //     }
        // })

        // const clubIdList = clubs.map(club => club.clubId*1)

        // const requestList = await Request.find({club: {$in: clubIdList},status: 'Pending'}).select('-_id -__v -club')

        let requestList = await Request.find({club: {$in: clubIdList},status: 'Pending'})
        
        requestList = requestList.map(request => ({userId: request.userId,firstName: request.firstName,lastName: request.lastName,email: request.email,department: request.department,...clubs.filter(club => club.clubId === request.club)[0]}))

        console.log(requestList)

        return res.status(200).json(
            {
                status: 'success',
                requestAt: req.requestTime,
                result: requestList.length,
                data: {
                    users: requestList
                }
            }
        )

    }catch(err){
        console.log(err)
        console.log('Error in Get Request List Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message|| 'Error Found'
        })
    }

}

exports.memberApprovalHandler = async (req,res,next) => {

    const errorMessage = {
        status: 'fail',
        requestAt: req.requestTime,
        message: 'Please Provide Valid Id or Club'
    }

    try{

        console.log(req.body)
        
        const {id,club} = req.params

        console.log(id,club,req.body)

        const { clubIdList,approvalStatus } = req.body

        if(!id || !club || 'approvalStatus' in req.body === false){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Id and Approval Status'
            })
        }

        //---------------------check user has admin or committee priviledge to that id club or not---------------------//

        if(!clubIdList.includes(club*1)){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'You are not authorized'
            })
        }

        //---------------------check Request User exist in request list or not---------------------//

        const request = await Request.findOne({userId: id,club,status: 'Pending'})

        if(!request){
            return res.status(400).json(errorMessage)
        }

        //---------------------check Request User exist in club user list or not---------------------//

        const clubUser = await ClubUser.findOne({userId: id,clubId: club,approvalStatus: 'Pending'})

        if(!clubUser){
            return res.status(400).json(errorMessage)
        }

        // console.log(request,clubUser)

        if(approvalStatus){

            const approvedStatus = await ClubUser.findOneAndUpdate({userId: id,clubId: club,approvalStatus: 'Pending'},{approvalStatus: 'Approved'},{new: true,runValidators: true})

            if(approvedStatus){
                await Request.deleteOne({userId: id,club,status: 'Pending'})
            }
            else{
                return res.status(400).json({
                    status: 'fail',
                    requestAt: req.requestTime,
                    message: 'Something Went Wrong'
                })
            }
        }else{

            await ClubUser.deleteOne({userId: id,clubId: club,approvalStatus: 'Pending'})

            await Request.deleteOne({userId: id,club,status: 'Pending'})

        }

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            message: 'Request Handled Successfully'
        })
    }
    catch(err){
        console.log(err)
        console.log('Error in Member Approval Handler Controller')
        return res.status(500).json({
            status: 'error',
            requestAt: req.requestTime,
            message: err.message|| 'Error Found'
        })
    }

}

exports.selectCommittee = async (req,res,next)=>{

    try{

        console.log(req.body)

        const {email,clubId,clubIdList} = req.body

        if(!clubId){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Club Id'
            })
        }

        if(!clubIdList.includes(clubId*1)){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'You are not authorized'
            })
        }

        const [{id}] = await User.find({email})

        if(!id){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'Please Provide Valid Email'
            })
        }
        
        const status = await ClubUser.findOneAndUpdate({userId: id,clubId: clubId,committee:false,admin: false},{committee: true},{new: true,runValidators: true})

        if(!status){
            return res.status(400).json({
                status: 'fail',
                requestAt: req.requestTime,
                message: 'This user belongs to this club may be already a committee member or admin , or not a member of this club'
            })
        }

        return res.status(200).json({
            status: 'success',
            requestAt: req.requestTime,
            message: 'Request Handled Successfully'
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

exports.setClubIdList = async (req,res,next)=> {
    
        try{
    
            const userId = req.body.user._id
    
            const clubUser = await ClubUser.find({userId}).select('-_id -userId -__v')
    
            const clubIdList = clubUser.map(club => club.clubId*1)
    
            req.body.clubIdList = clubIdList
    
            next()
    
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