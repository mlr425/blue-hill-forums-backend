const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db.js')
const postRoutes = require('./routes/posts.js')
const userRoutes = require('./routes/users.js')
const bodyParser = require('body-parser');

const app = express();
dotenv.config();
connectDB();

//https://www.youtube.com/watch?v=M44umyYPiuo&ab_channel=MariusEspejo 
//add tests w/ jest to apis

const PORT = process.env.PORT || 5000;

app.use(express.json({limit:"30mb",extended: true})); 
app.use(express.urlencoded({limit:"30mb",extended: true}));
// app.use(bodyParser.json({limit:"30mb",extended:true})) //dont allow large images
// app.use(bodyParser.urlencoded({limit:"30mb",extended:true}))
app.use(cors());

app.use('/posts', postRoutes);
app.use('/user', userRoutes);
app.use('/',(req,res) => {
    res.send('BHF API')
})

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
// app.listen(PORT)
module.exports = app