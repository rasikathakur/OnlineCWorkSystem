const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const DeanSchema = new mongoose.Schema({
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
DeanSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }   
    next();
});

//now we need collection
const Deans = new mongoose.model("dean", DeanSchema);
module.exports = Deans;
