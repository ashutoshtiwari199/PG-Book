const Room = require('../models/room')


exports.createRoom = (req,res)=>{

    const {roomno, guestcapacity, occupency, propertyname} = req.body;
    const {adminName, adminId} = req.adminprofile;


    try {
        const room = new Room({
            roomno,
            guestcapacity,
            occupency,
            propertyname,
            adminname:{adminname: adminName, admin_id: adminId}

        })
        room.save((err, response)=>{
            if (err) res.status(400).json({errormsg: err, message: "Something went wrong in createtoom"});
            if (response) res.status(200).json({status_msg: 'success', message: "Room is created successfully.", response });
        })
    } catch (error) {
        res.status(400).json({err: error, message:"Error catched in createroom"})
    }
}
