const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true,'A request must have a userId'],
    },
    firstName: {
        type: String,
        required: [true,'A request must have a firstName']
    },
    lastName: {
        type: String,
        required: [true,'A request must have a lastName']
    },
    email: {
        type: String,
        required: [true,'A request must have a email']
    },
    department:{
        type: String,
        required: [true,'A request must have a department']
    },
    club: {
        type: Number,
        required: [true,'A request must have a clubId']
    },
    status:{
        type: String,
        default: "Pending"
    }
})

const Request = mongoose.model('Request',requestSchema)

module.exports = Request