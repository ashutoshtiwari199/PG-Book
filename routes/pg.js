const express = require('express');
// import { isAuth } from '../controller/auth';
const {isAuth, isAdmin} = require('../controller/auth')
const router = express();
const {check , validationResult} = require('express-validator')
const {createPg} = require('../controller/pg')

router.post('/registerpg',[
    check("pgname", "Please provide the PG name").isLength({ min: 4 }),
], isAuth, isAdmin, createPg )










module.exports= router