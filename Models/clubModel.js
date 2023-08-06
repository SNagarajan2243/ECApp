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
    imgName: {
        type: String,
        default: ''
    },
    
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

clubSchema.virtual('image').get(function(){
    console.log(this.imgName)
    return `images/logos/${this.imgName}`
})

const Club = mongoose.model('Club',clubSchema)

module.exports = Club