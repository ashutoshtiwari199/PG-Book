const mongoose = require('mongoose')

const pgSchema =new mongoose.Schema({

    pgname:{
        type:String,
        required: true,
        max: 32,
        trim:true
    },
    admininfo:{
        type:Object,
        // max:32,
        trim:true,
        required:true
    },
    address:{
        type:String,
        max:80,
        trim: true
    },
    roomcount:{
        type:Number,
        required:true,
        trim:true,
        default:1
    },
    buildingdetail:[{
        totalfloor:Number,
        ownername:String
    }]

},{timestamps:true})


module.exports = mongoose.model("PG", pgSchema)