const mongoose = require('mongoose')

const express = require('express')

const dotenv = require('dotenv')

dotenv.config({path: './config.dotenv'})

const app = require('./app')

const DB = process.env.DATABASE_LINK

mongoose.connect(DB,{}).then(() => console.log(`DB Connection Successfull`))
.catch(err => console.log(err)
)

app.listen(3000,'0.0.0.0',()=>{
    console.log(`App running on port 3000`)
})