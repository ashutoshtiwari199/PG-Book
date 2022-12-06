const express = require('express')
const router = express.Router();
const {check , validationResult} = require('express-validator')
const {hash, compare} = require('bcryptjs')
const path = require('path');
const User = require('../models/user')
const {verify, sign} = require('jsonwebtoken');
const {isAuth } = require('../controller/auth');
const { sendEmail } = require('../controller/nodemailer');


router.post(
    '/signup',
  [
    check("name", "Name should be at least 3 char").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password", "Password should be at least 3 char").isLength({ min: 3 })
  ],
  async (req,res)=>{
      const error = validationResult(req);
      if(!error.isEmpty()){
          return res.status(422).json({
            error: error.array()[0].msg
          });
      }
      const {name, email, password} = req.body

      try {

        const hashedPassword = await hash(password,10)
        console.log(hashedPassword);
        const user = new User({
          name,
          email,
          password: hashedPassword
        })
        user.save((err,user)=>{
          if(err)  {
             return res.status(400).json({
             err: err,
             messege: "Unable to save in db"
             });
          }
          res.status(200).json({status: "OK", messege: {
            name: user.name,
            email: user.email,
            id:user._id
          }})
        })
      } catch (error) {
        console.log(error)
        return res.status(400).json(error)
      }
  }
)


router.post('/signin', [
  check("email", "email is required").isEmail(),
  check("password", "Password field is required").isLength({min:2})
],
  async (req,res)=>{
    const error= validationResult(req);
    const {email, password}  = req.body;

    if(!error.isEmpty()){
      return res.status(422).json({
        error: error.array()[0].msg
      })
    }

    // find the user in db
    User.findOne({email}, async (err, user)=>{
      if( err || !user){
        return res.status(400).json({
          error: err,
          message: "User Email does not exist"
        })
      }
      // compare the password in db
      const validPassword = await compare(password, user.password);
      if(!validPassword) return res.status(400).json("Email & password didn't match")
       
      // create token
      const {_id, name, email, role} = user;
      const token= sign({_id}, process.env.ACCESS_TOKEN_SECRET,{expiresIn: "1d"})
      res.cookie('token', token, {expire: new Date()+99 }) 
      res.json({token, user:{_id,name, email, role}})
    })
  }
)

router.get('/signout', (req,res)=>{
  res.clearCookie("token");
  console.log(req.token)
  res.json({message: "User Signout successfully"})
})

/* Forgot password
* Step 1. take the emailId from user
* Step 2. Sent a link to their email. take a password and confirm password.
* Step 3. Save new password
*/

// Step 1.

router.post('/forgot_password',[
  check("email", "Email is required").isEmail(),
], (req,res)=>{
  const error = validationResult(req);
  if(!error.isEmpty()){
    return res.status(422).json({
      error: error.array()[0].msg
    });
  }
  const {email} = req.body;
  try {
    User.findOne({email}, async(err, user)=>{
      if (err || !user){
        return res.status(400).json({
          error: err,
          message: "User Email does not exist"
        })       
      }
      const {name, email,forgotPasswordOtp ,_id} = user
      console.log(user)
      let OTP = Math.floor(10000 + Math.random() * 900000);
      let forgotPasswordOTP= sign({OTP: OTP.toString()}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "300s"})
      User.updateOne({_id: _id}, {$set :{"forgotPasswordOtp": [forgotPasswordOTP]}}, (err,data)=>{
        if(err) res.status(400).json({msg: err, message: "Unable to generate the OTP"})
        console.log("updated")
        const forgotPasswordToken= sign({id: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "300s"})
        /***
         * This should be send in registered email.
        ***/
        res.cookie('token', forgotPasswordToken, {expire: new Date().setTime(new Date().getTime()+ 5*60*1000) }) // 5 minute life span for coockies 
        let link=  `http://localhost:8000/api/set_new_password/${forgotPasswordToken}`;
        let forgotEmailMsg = `Your OTP is ${OTP}. \n You can forgot password by clicking on the below link \n it is valid for 5 minutes ${link}`
        let subject= "Forgot password email"
        sendEmail(email, name, forgotEmailMsg, subject  )
        res.status(200).json({msg:"Forgot password request", message: `Please check your email. ${link}`})
      })
    })
  } catch (error) {
    res.json(error)
  }
})



//STEP 2.

router.get('/set_new_password/:token',(req,res)=>[
  verify(req.params.token, process.env.ACCESS_TOKEN_SECRET,(err,decode)=>{
    if(err) return res.json({err, msg: "Please request again for forgot password"})
    res.sendFile(path.join(__dirname,'../controller/newPassword.html'))
  })
])

// STEP 3.

/**
 * Instruction for this if You are choosing the OTP based authentication you will need to 
 * pass the req.body.email: user@gmail.com.
 */
router.post('/save-new-password_link',[
  check("password", "Password should be minimum 6 char").isLength({ min: 6 }),
  // check("confirmPassword", "Password & confirm password must be same.").equals(password)
], async (req,res)=>{
  const error = validationResult(req);
  if(!error.isEmpty()){
      return res.status(422).json({
        error: error.array()[0].msg
      });
  }
  const {password,confirmPassword, token} = req.body;
  if(password !==confirmPassword){
    return res.status(400).json({msgcode:'error', message: "Password & ConfirmPassword did not match"})
  }
  const newPassword=await hash(password,10)
  if(!token){
    return res.status(400).json({msgcode:'error', message: "Click again on the forgot link"})
  } else {
    try {    
    verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decode)=>{
      if(err) return res.json({err, msg: "Your session is expired, Please try again"})
      // console.log(decode)
      User.findOne({_id: decode.id},(err, info)=>{
          if(!info) return res.status(404).json({status: "error", message: "Something went wrong!!!"})
          if(info.forgotPasswordOtp[0] === "OTP Used") return res.status(400).json({status: "error", message: "Password reset done throuh OTP, Please generate new "})
          if(info.forgotPasswordOtp[0] === "Password reset done by link") return res.status(400).json({status: "error", message: "You have already used this link, Please generate new"})
          User.updateOne({_id :decode.id},{$set : {"password" : newPassword, forgotPasswordOtp: ["Password reset done by link"]}},(err,user)=>{
            if(err) res.status(400).json({error: err, message: "Failed to update your password"})
            res.clearCookie("token");
            res.status(200).json({status:"OK", message: "Your password is successfully updated"})
          })
        })
      })
    } catch (error) {
      res.status(400).json("something went wrong while saving a new password")
    }  
  }
} )


router.post('/save-new-password_opt',[
  check("otp", "OTP should be 6 digit").isLength({ min: 6 }),
  check("email", "Email is required for this route").isEmail(),
  check("password", "Password should be minimum 6 char").isLength({ min: 6 })
],async(req,res)=>{
  const error = validationResult(req);
  if(!error.isEmpty()){
      return res.status(422).json({
        error: error.array()[0].msg
      });
  }
  const {password,confirmPassword} = req.body;
  if(password !==confirmPassword){
    return res.status(400).json({msgcode:'error', message: "Password & ConfirmPassword did not match"})
  }
  const newPassword=await hash(password,10)
  if(!req.body.email && !req.body.otp) {
    return res.status(400).json({msgcode:'error', message: "Please provide the email & OTP"})
  } else {
    try {   
        User.findOne({email: req.body.email},(err, info)=>{
          if(err) return res.status(400).json(err)
          if(!info) return res.status(404).json({status: "error", message: "Given email is not found"})
          if(info.forgotPasswordOtp[0] === "OTP Used") return res.status(400).json({status: "error", message: "You have used your OTP"})
          if(info.forgotPasswordOtp[0] === "Password reset done by link") return res.status(400).json({status: "error", message: "Password reset done throuh link, Please generate new"})
          verify( info.forgotPasswordOtp[0], process.env.ACCESS_TOKEN_SECRET,(err,decode)=>{
            if(err) return res.json({err, msg: "Your OTP is expired, Please try again"})
            if(decode.OTP != req.body.otp) return res.status(400).json("Wrong OTP")
            User.updateOne({_id :info._id},{$set : {"password" : newPassword, forgotPasswordOtp: ["OTP Used"]}},(err,user)=>{
                if(err) return res.status(400).json({error: err, message: "Failed to update your password"})
                console.log(user)
                res.status(200).json({status:"OK", message: "Your password is successfully updated"})
            })            
          })
        }) 
        // console.log(decode)
      } catch (error) {
        res.status(400).json("something went wrong while saving a new password")
      }  
  }
})



router.get('/protected', isAuth, (req,res)=>{
  res.json({msg: "this is protected routes", u: req.userId});
})









module.exports = router;