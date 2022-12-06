const express = require('express');
// import { isAuth } from '../controller/auth';
const router = express();
const {isAuth, isAdmin} = require('../controller/auth')
const {check , validationResult} = require('express-validator')
const {createRoom} = require('../controller/room') 


router.post('/createroom',[
    check("roomno", "Please provide the roomno in format 102 i.e: {1:first floor, 01: actual room no}").isLength({ min: 3 }),
], isAuth, isAdmin, createRoom )










module.exports= router