const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CCSchema = new mongoose.Schema({
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
class: {
    type: String,
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
CCSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }   
    next();
});

//now we need collection
const Class_cordinators = new mongoose.model("class_coordinator", CCSchema);
module.exports = Class_cordinators;
