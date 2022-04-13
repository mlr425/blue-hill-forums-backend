// import mongoose from 'mongoose';
const mongoose = require('mongoose')

//might come back around and change some of this
//creator is like the Id who created it, name = name of user who created
const postSchema = mongoose.Schema({
    creator: String,
    title: String,
    message: String,
    name: String,
    selectedFile: String,
    likes: {
        type: [String],
        default: []
    },
    comments:{
        type:[String],
        default:[]
    },
},
{
    timestamps: true
});
//timestamps just said True before
const PostMessage = mongoose.model('PostMessage',postSchema);

module.exports =  PostMessage;