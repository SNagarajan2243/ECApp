const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    createdBy: {
        type: String,
        required: [true,'A post must have a createdBy']
    },
    clubId: {
        type: Number,
        required: [true,'A post must have a clubId'],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    caption: {
        type: String,
        required: [true,'A post must have a caption']
    },
    tags: {
        type: String,
        default: ""
    },
    modes: {
        type: Boolean,
        default: false
    },
    format: {
        type: String,
        enum: [
            {
            values: ['image','text'],
            message: ['Format is either: image or text']
            }
        ],
        required: [true,'A post must have a format']
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: {
        type: Array,
        default: []
    },
    imgName: {
        type: String,
        default: ''
    },
    text: {
        type: String,
        default: ''
    }},{
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
)

//Virtual Populate

postSchema.virtual('image').get(function(){
    if(this.format==='image'){
        return `images/posts/${this.imgName}`
    }
    else
        return ''
})

const Post = mongoose.model('Post',postSchema)

module.exports = Post