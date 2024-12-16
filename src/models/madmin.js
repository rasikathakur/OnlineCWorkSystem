const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema({
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
AdminSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }   
    next();
});
//now we need collection
const Admin = new mongoose.model("admin", AdminSchema);
module.exports = Admin;
