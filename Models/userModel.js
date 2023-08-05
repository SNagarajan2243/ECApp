const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    department: {
        type: String,
    },
    phoneNo: {
        type: String,
    },
    yearOfStudy: {
        type: String,
    },
    email: {
        type: String,
        required: [true,'A User must have a email'],
        unique: true
    },
    password: {
        type: String,  
        required: [true,'A User must have a password'],
        minlength: 4,
        select: false
    },
    bloodDonor:{
        type: Boolean,
        default: 0
    },
    bloodGroup:{
        type: String,
        default: ""
    },
    // role: {
    //     type: String,
    //     enum: [
    //         {
    //           values: ['Student','Faculty','Admin'],
    //           message: ['Role must either: Student or Faculty or Admin']
    //         }
    //     ]
    // }, 
    // position: String,
    passwordChangedAt: Date,
})

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

const User = mongoose.model('User',userSchema)

module.exports = User


