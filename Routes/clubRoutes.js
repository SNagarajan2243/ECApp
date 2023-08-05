const express = require('express')

const router = express.Router()

const {checkUserExist} = require('../Controllers/authController')

const {joinClub,getJoinableClub,checkPriviledge,getRequestList,memberApprovalHandler,selectCommittee} = require('../Controllers/clubController')

router.route('/club').get(checkUserExist,getJoinableClub).patch(checkUserExist,joinClub).post(checkUserExist,checkPriviledge,selectCommittee)

router.route('/request').get(checkUserExist,checkPriviledge,getRequestList)

router.route('/request/:id/:club').post(checkUserExist,checkPriviledge,memberApprovalHandler)

module.exports = router