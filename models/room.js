const mongoose = require('mongoose')

const roomSchema =new mongoose.Schema({
    propertyname:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Pg',
        required:[true, "Property name is required!!!"],
        trim:true
    },
    adminname:{//o
        type:String,
        required:[true, "Admin name Should not be blank"],
        trim:true
    },
    roomno:{ //o
        type: Number,
        required:[true, "Room no/tag is required"],
        default: 000
    },
    guestcapacity:{//o
        type: Number,
        required: [true, "Capacity should be there."],
        default: 1      
    },
    guestdetail:{
        type: Array,      //[{name: "Ashu", joining_date: "DD/MM/YY", bedno: 1}]
                            // bedno start from the close to main door,
    },
    occupancy:{ //0
        type: Number,
        required:true,
        default: 0 // 0 means empty room
    }
},{timestamps:true})


module.exports = mongoose.model("Room", roomSchema)