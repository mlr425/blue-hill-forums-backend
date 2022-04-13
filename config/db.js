//import mongoose from 'mongoose';
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.CONNECTION_URL)
        //console.log(`MongoDB connected: ${conn.connection.host}`)

    } catch (error) {
        // console.log('Unable to establish connection to DB')
        // console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB