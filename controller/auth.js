const {verify} = require('jsonwebtoken');
const User = require('../models/user');
const { expressjwt, ExpressJwtRequest } =require("express-jwt");


const destroyedToken =[]

const isAuth=(req, res, next)=>{
    const authorization = req.headers.bearer;
    if(!authorization) return res.status(400).json("pass the token")
    const token = authorization
    verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decode)=>{
        if(err) return res.json({err, msg: "Please login again"})
        req.userId= decode
        next();
    })
}

const isAdmin = (req,res,next)=>{
    const authorization = req.headers.bearer;
    if(!authorization) return res.status(400).json("pass the token")
    const token = authorization
    verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decode)=>{
        if(err) return res.json({err, msg: "Please login again"})
        User.findById(decode._id, (err, user)=>{
        if(err) return res.json({err, msg: "Problem in isAdmin controller"})
        if(user.role !== "Admin") return res.status(400).json({message: "You are not a Admin"})
            // req.adminId = user._id;
            // req.adminName = user.name;
            req.adminprofile = {
                adminId: user._id,
                adminName: user.name
            }
            next()
        })
})
}

// const isSignedIn =  expressjwt({
//     secret: process.env.SECRET,
//     userProperty: "auth"
//   },console.log("passed fro isSingnedIn"));

// //custom middlewares
// exports.isAuthenticated = (req, res, next) => {
//     console.log("from isAuthenticated",req.profile)
//     let checker = req.profile && req.auth && req.profile._id == req.auth._id;
//     if (!checker) {
//       return res.status(403).json({
//         error: "ACCESS DENIED"
//       });
//     }
//     next();
//   };
  

const isEmailRegistered = (req,res, next)=>{

}

module.exports = {
    isAuth,
    isAdmin
}