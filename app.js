require("dotenv").config();

const express = require('express')
const mongoose = require("mongoose");
const app = express();
// const bodyParser= require('body-parser');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoute= require('./routes/user');
const authRoute = require('./routes/auth')
const roomRoute = require('./routes/room')
const pgRoute = require('./routes/pg')




// Middlewares

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.use(cors());

// DB Connection

mongoose.connect(process.env.DATABASE)
.then(() => {
    console.log("DB CONNECTED");
  });


// My routes
app.use('/api', userRoute );
app.use('/api', authRoute );
app.use('/api', roomRoute );
app.use('/api', pgRoute );


const port = process.env.PORT || 8000;

app.listen(port,()=>{
    console.log(`App is running on ${port}`)
})