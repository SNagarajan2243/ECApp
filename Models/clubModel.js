const mongoose = require('mongoose')

const clubSchema = new mongoose.Schema({

    clubId: {
        type: Number,
        required: [true,'A club must have a clubId'],
        unique: true
    },
    clubName: {
        type: String,
        required: [true,'A club must have a clubName'],
        unique: true
    },
    
})

const Club = mongoose.model('Club',clubSchema)

module.exports = Club