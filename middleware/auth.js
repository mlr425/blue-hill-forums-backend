// import jwt from 'jsonwebtoken'
// import User from '../models/user.js';
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')


const auth = async ( req,res,next) => {   
    try {
        const token = req.headers.authorization.split(' ')[1];
        const isCustomAuth = token.length < 500; //if true = custom/jwt, else Oauth/google
        
        let decodedData;

        if(token && isCustomAuth){
            decodedData = jwt.verify(token,process.env.JWT_SECRET)
            req.userId = decodedData?.id

            // console.log('reqid',req.userId) //flatid
            // const test = await User.findById(decodedData?.id)
            // console.log('testid:',test._id)  //mongodbid
        }else{
            decodedData = jwt.decode(token)
            req.userId = decodedData?.sub;
        }
        next();

    } catch (error) {
        //console.log(error)
        res.status(401).json({message:'Not Authorized'})
    }
}

module.exports = auth;