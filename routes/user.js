const express = require("express");
const { isAuth, isAdmin } = require("../controller/auth");
const router = express.Router();
const isEmailRegistered = require('../controller/helperfun');
// const { getMaxListeners } = require("./room");
const User = require('../models/user')


router.get('/',(req,res)=>{
    res.status(200).json({status: "OK", message: "Your api is up and running"})
})


router.post('/checkemailavailaibility',isAuth,isAdmin, (req,res)=>{ 
    User.findOne({email:req.body.email},(err,user)=>{
        if(err) return res.json(400).json({err:err, message: "This email is not registered with us"})
        res.status(200).json("Email is registered")
    })    // if (!isEmailRegistered(req.body.email)) return "Email is not registered with us"
})


module.exports = router;
