// import mongoose from "mongoose";
// import PostMessage from "../models/postMessage.js";
// import User from "../models/user.js";

const mongoose = require('mongoose')
const PostMessage = require('../models/postMessage.js')
const User = require('../models/user.js')
const ObjectId = require('mongoose').Types.ObjectId;

/*
Description: Retrieve Posts from DB
Route: GET /posts
Access: Public
*/
const getPosts = async (req,res) => {
    //console.log('asking for posts pg:',req.query)
    const {page} = req.query
    const LIMIT = 10
    //const startIndex = (Number(page) - 1) * LIMIT
    const total = await PostMessage.countDocuments({})

    //const posts = await PostMessage.find().sort({_id: -1}).limit(LIMIT).skip(startIndex);
    const posts = await PostMessage.find().sort({_id: -1}).limit(LIMIT*page)

    try {
        res.status(200).json({data: posts,currentPage: Number(page), totalNumberOfPages: Math.ceil(total/LIMIT)})
    } catch (error) {
        res.status(404).json({message: error})
    }
}

/*
Description: Retrieve single Post from DB
Route: GET /posts/:id
Access: Public
*/
const getPost = async (req,res) => {
    const {id} = req.params
    try {
        
        const post = await PostMessage.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(404).json({message: 'Invalid Post ID'})
    }
}
const getPostsFromUserId = async (req,res) => {
    const {id} = req.params
    /*
    if the user never created a post, then nobody would know they exist except from comments
    so can just display - user has no posts if they click on profile
    */
    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            //If the ID isnt a mongoose validId, we know it must be google or invalid
            //so we'll just try to query the DB for the posts (inefficent)
            //then we'll check if we we're able to get anything back else we know its invalid
            //handling for OAuth

            //if the user hasnt created any posts, dont display name/postcount
            //just say no posts, will fix a lot of the design
        }else{
            //check if a custom user exists
            const user = await User.findById(id)
            if(!user){
                return res.status(404).json({message: 'User not found.'})
            }
        }

        //check that user has posts else return some info
        const postsFromUserId = await PostMessage.find({creator: id}).sort({_id: -1})
        if(postsFromUserId.length == 0){
            //return res.status(204).json({message:'No posts from this user'})
            //status 204 doesnt send json msg back
            return res.status(404).json({message: 'Unable to retrieve posts from user'})
        }

        res.status(200).json({posts: postsFromUserId})
        
    } catch (error) {
        res.status(404).json({message: 'Unable to retrieve posts from user'})
    }
}


/*
Description: Create a Post
Route: POST /posts/
Access: Must be signed in
*/
const createPost = async (req,res) => {
    const post = req.body

    const newPost = new PostMessage({...post, creator: req.userId});

    try {
        //https://github.com/mauvpark/JsMastery-MERN-project/blob/main/server/controllers/posts.js
        //might need to handle the .save differently
        await newPost.save()
        res.status(201).json(newPost)
    } catch (error) {
        res.status(409).json({message: error})
    }

}

/*
Description: Update a Post
Route: PATCH /posts/:id
Access: Editor must be creator
*/
const updatePost = async (req,res) => {
    const {id: _id} = req.params;
    const post = req.body;
    if(!mongoose.Types.ObjectId.isValid(_id)){
        return res.status(404).send("No Post with that ID")
    }

    //confirm editor(user logged in) is post creator before modifications
    const user = await User.findById(req.userId)
    if(!user){
        return res.status(401).json({message: 'User not found.'})
    }

    const currentPost = await PostMessage.findById(_id)
    //console.log(currentPost.creator,req.userId,user._id.toString())

    if(currentPost.creator !== user._id.toString()){
        return res.status(401).json({message: 'You are not the creator of this post, ignoring updates.'})
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(_id,{...post, _id}, {new: true});
    res.json(updatedPost);
}

/*
Description: Delete a Post given the ID
Route: DELETE /posts/:id
Access: Editor must be creator
*/
const deletePost = async (req,res) => {
    const {id: _id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(_id)){
        return res.status(404).send("No post with that ID")
    }
    
    //confirm editor(user logged in) is post creator before modifications
    const user = await User.findById(req.userId)
    if(!user){
        return res.status(401).json({message: 'User not found'})
    }

    const currentPost = await PostMessage.findById(_id)
    if(!currentPost){
        return res.status(404).json({message:'Post ID not found.'})
    }
    //console.log(currentPost.creator,req.userId,user._id.toString())

    if(currentPost.creator !== user._id.toString()){
        return res.status(401).json({message: 'You are not the creator of this post, ignoring updates.'})
    }

    await PostMessage.findByIdAndRemove(_id);
    res.status(200).json(_id)
}

/*
Description: Like/Unlike Post 
Route: PATCH /posts/:id/likePost
Access: User must be logged in
*/
const likePost = async (req,res) => {
    const {id} = req.params;
    //user login?
    if(!req.userId){
        return res.status(401).json({message: 'User not found'})
    }

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).send("No post with that ID")
    }

    //if the userId doesnt exist in the post ids likes, we can add it to represent a like
    //get the post 
    const post = await PostMessage.findById(id)

    //check if users id in likes already
    const foundIdIdx = post.likes.findIndex((uid) => {
        return uid === String(req.userId)
    })
    
    if(foundIdIdx === -1){
        //user id was not in likes, so we add it
        post.likes.push(req.userId)
    }else{
        //dislike post / remove it 
        post.likes = post.likes.filter((uid) => {
            return uid !== String(req.userId)
        })
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id,post, {new: true})
    res.status(200).json(updatedPost)
}

/*
Description: Comment on a Post
Route: POST /posts/:id/commentPost
Access: User must be logged in
*/
const commentPost = async (req,res) => {
    const {id} = req.params
    const {comment} = req.body

    if(!req.userId){
        return res.status(401).json({message: 'User not found'})
    }

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).send("No post with that ID")
    }
    
    //get the post
    const post = await PostMessage.findById(id)
        
    //go into the posts comments and append new post(req.body)
    post.comments.push(comment)

    //send the updated post back to DB
    const updatedPost = await PostMessage.findByIdAndUpdate(id,post,{new: true})
    res.status(201).json(updatedPost);     
}

module.exports = {getPosts,getPost,getPostsFromUserId,createPost,updatePost,deletePost,likePost,commentPost}