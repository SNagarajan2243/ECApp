const express = require('express')

const app = express()

const morgan = require('morgan')

const cors = require('cors')

const userRouter = require('./Routes/userRoutes')

const clubRouter = require('./Routes/clubRoutes')

const authRouter = require('./Routes/authRoutes')

const postRouter = require('./Routes/postRoutes')

//--------------------MiddleWare-------------------//

app.use(express.json())

// app.use(express.urlencoded({ extended: true }))

app.use('/images/posts/',express.static(`${__dirname}/images/posts`))

app.use(morgan('dev'))

app.use(cors({
    origin: '*'
}))

// app.use((req,res,next)=>{
//     let ip = req.ip 
//             || req.connection.remoteAddress 
//             || req.socket.remoteAddress 
//             || req.connection.socket.remoteAddress;
//     if(ip==='10.11.5.98')
//         return res.status(500).json({
//             message: "Joker's IP is Blocked"
//         })
// })

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString()
    next()
})

//-------------------Routes Middleware-------------//

app.use('/api/v1/users',userRouter)

app.use('/api/v1/clubs',clubRouter)

app.use('/api/v1/auth',authRouter)

app.use('/api/v1/posts',postRouter)

app.all('*',(req,res,next)=>{

    const url = req.originalUrl.split('/')

    const route = url[url.length-1]

    res.status(404).json({
        status: 'fail',
        requestAt: req.requestTime,
        message: `Can't find '${route}' on this server`
    })
})

module.exports = app