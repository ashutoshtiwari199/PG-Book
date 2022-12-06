const Pg = require('../models/pg');
const { response } = require('../routes/room');


exports.createPg = (req,res)=>{

    const {pgname, roomcount} = req.body;
    const {adminName, adminId} = req.adminprofile;

    try {
        const authorization = req.headers.bearer;
        if(!authorization) return res.status(400).json("Please provide the token")
        
        const pg = new Pg({pgname, roomcount, admininfo:{adminName,adminId}})
        pg.save((err, response)=>{
            if (err) res.status(400).json({errormsg: err, message: "Something went wrong in create PG"});
            // console.log(response)
            

            res.status(200).json({status_msg: 'success', message: "PG is registered successfully.", id: response._id });
        })
    } catch (error) {
        res.status(400).json({err: error, message:"Error catched in register the PG"})
    }
}

