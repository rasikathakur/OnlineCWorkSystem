const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const PwdSchema = new mongoose.Schema({
crn:{
    type: Number,
    required: true,
    unique: true
},
email: {
    type: String,
    required: true,
    unique: true
},
otp: {
    type: Number,
    required: true,
    unique: true
}}, {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
    expireAfterSeconds: 20
});

//now we need collection
const Pwdreset = new mongoose.model("pwdreset", PwdSchema);
module.exports = Pwdreset;
