const User = require('../models/user');


exports.isEmailRegistered =(email)=>{
    console.log(email)
    User.findOne({email},(err,user)=>{
        if(err) return res.json(400).json({err:err, message: "This email is not registered with us"})
        return true
    })
}

