const mongoose = require('mongoose')

const clubUserSchema = new mongoose.Schema({

    clubId: {
        // type: String,
        type: Number,
        required: [true,'A clubUser must have a clubId']
    },
    userId: {
        type: String,
        required: [true,'A clubUser must have a userId']
    },
    admin: {
        type: Boolean,
        default: false
    },
    committee: {
        type: Boolean,
        default: false
    },
    approvalStatus: {
        type: String,
        enum: [
            {
            values: ['Pending','Approved'],
            message: ['Approval Status is either: Pending or Approved']
            }
        ],
        default: 'Pending'
    },

})

const ClubUser = mongoose.model('ClubUser',clubUserSchema)

module.exports = ClubUser