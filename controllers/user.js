// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import User from '../models/user.js';

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user.js')


/*
Description: Register user 
Route: POST /user/register
Access: Public
*/
const registerUser = async (req,res) => {
    const {name, email, password, confirmPassword} = req.body;
    
    try {
        //check if user exists
        const existingUser =  await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists."})
        }

        if(password !== confirmPassword){
            return res.status(400).json({message: "Passwords do not match"})
        }
        
        const salt = await bcrypt.genSalt(12)
        const hashedPw = await bcrypt.hash(password, salt);

        const result = await User.create({
            name, 
            email, 
            password: hashedPw
        })

        const token = jwt.sign({email: result.email, id: result._id}, process.env.JWT_SECRET, {expiresIn:"1h"});
        
        res.status(201).json({result, token })

    } catch (error) {
        res.status(500).json({message: 'Something went wrong, send all data fields'})
    }

    
}

/*
Description: Login user
Route: POST /user/login
Access: Public
*/
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    try {
        //find existing user
        const existingUser = await User.findOne({email});

        if(!existingUser){
            return res.status(404).json({message: "Username or password is invalid."})
        }

        const isPwCorrect = await bcrypt.compare(password,existingUser.password);

        if(!isPwCorrect){
            return res.status(400).json({message:"Username or password is invalid."})
        }

        const token = jwt.sign({email: existingUser.email, id: existingUser._id}, process.env.JWT_SECRET, {expiresIn:"1h"});
        
        res.status(200).json({result: existingUser, token })


    } catch (error) {
        res.status(500).json({message: 'Something went wrong, please try again later.'})
    }
}


module.exports = {loginUser,registerUser}