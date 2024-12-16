const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const HodSchema = new mongoose.Schema({
    crn: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobile:{
        type:Number,
        required: true,
        unique: true
    },
    profilephoto: {
        type: String, // Assuming storing file paths as strings
        required: true
    },
    department: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }
});
HodSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }   
    next();
});

//now we need collection
const Hods = new mongoose.model("hod", HodSchema);
module.exports = Hods;
