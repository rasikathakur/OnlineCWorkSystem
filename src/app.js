const handlebars = require("handlebars");
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const multer = require("./middlewares/upload");
const multer1 = require("./middlewares/uploadpic");
const multer2 = require("./middlewares/uploadcsv");
const mongoose = require("mongoose");
const notifier = require('node-notifier');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const csvtojson = require('csvtojson');
const otpGenerator = require('otp-generator');
const bodyParser = require('body-parser');
//"use strict";
//const prompt = require('prompt-sync')({sigint: true});
const moment = require('moment');
const WeeklyReport = require("./models/weekly_report");
const cron = require('node-cron');


const app = express();
const port = process.env.PORT || 5500;
app.use(express.urlencoded({ extended: true }));
const static_path = path.join(__dirname,"../public");


app.use(express.static(static_path));
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);
// Register a Handlebars helper for formatting dates
hbs.registerHelper('formatDate', function(dateString) {
    // Use moment.js to format the date string
    return moment(dateString).format('DD-MMM-YYYY');
});

hbs.registerHelper('getProfilePhotoUrl',function(photoUrl) {
    // Assuming photoUrl is something like "public/profileimages/pic1.jpg"
    const filename = photoUrl.split('/').pop(); // Extract filename from URL
    return `/profileimages/${filename}`; // Construct the correct path
  });

/*
getProfilePhotoUrl: function(photoUrl) {
      // Assuming photoUrl is something like "public/profileimages/pic1.jpg"
      const filename = photoUrl.split('/').pop(); // Extract filename from URL
      return `/profileimages/${filename}`; // Construct the correct path
    }
hbs.registerHelper("reviewed",
 function(reviwedByCC, reviwedByHod, reviwedByDean){
	if(reviwedByCC == "pending" && reviwedByHod == "pending" && reviwedByDean == "pending"  ) {
      return "To be reviewed";
    }
  	else if(reviwedByCC == "accepted" && reviwedByHod == "pending" && reviwedByDean == "pending" ){
      return "accepted by cc";
    }else if(reviwedByCC == "accepted" && reviwedByHod == "accepted" && reviwedByDean == "pending" ){
      return "accepted by hod";
    }
  else if(reviwedByCC == "accepted" && reviwedByHod == "accepted" && reviwedByDean == "accepted" ){
      return "congratulations";
    }
  else if(reviwedByCC == "rejected" && reviwedByHod == "pending" && reviwedByDean == "pending" ){
      return "denied by cc";
    }
  else if(reviwedByCC == "accepted" && reviwedByHod == "rejected" && reviwedByDean == "pending" ){
      return "denied by hod";
    }
  else if(reviwedByCC == "accepted" && reviwedByHod == "accepted" && reviwedByDean == "rejected" ){
      return "denied by dean";
    }
  
});

*/

//const MongoClient = require("mongodb").MongoClient;
//app.use(express.json());
//console.log(path.join(__dirname,"../public"));
//const student = require("models/student");

const db = require("./db/conn");
const Students = require("./models/students");
const Class_Coordinators = require("./models/class_coordinators");
const Deans = require("./models/deans");
const Hods = require("./models/hods");
const Cws = require("./models/cw_requests");
const Madmin = require("./models/madmin");
const { type } = require("os");
const { strict } = require("assert");
const pieReport = require('./models/pie');
const Pwdreset = require('./models/pwdreset');
const Admin = require("./models/madmin");
var ucrn, ccrn, hcrn, dcrn;
//var database;
app.use((req, res, next) => {
    req.db = db;
    next();
});


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'classsworks@gmail.com',
      pass: 'qbuv lqyd syoi zftr'
    }
  });
/*  
const securePassword = async (password)=>{
   const passwordHash = await bcrypt.hash(password, 10);
   console.log(passwordHash);
}

securePassword("Rasika@303");
*/
app.get("/",(req, res)=>{
    
    res.render("login")
});
/*app.get("/api/student",(req, res)=>{
    database.collection('student').find({}).toArray((err, result)=>{
        if(err) throw err
        res.send(result);
    })
});*/
app.get("/stud", async (req, res) => { // Mark the function as async
    try {
        const studRequests = await Students.find({});
        console.log(`${studRequests}`)
        res.render('stud',{studRequests});
    } catch (error) {
        console.error("Error fetching stud data:", error);
    }
});
app.get('/singlehod', (req, res) => {
    // Set the file path
    const file_path3 = path.join(__dirname,"../public/csv/hodformat.csv");
    
    // Send the file as an attachment
    res.download(file_path3, 'hodformat.csv', (err) => {
      if (err) {
        // Handle errors, such as file not found
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      } else {
        // File downloaded successfully
        console.log('File downloaded successfully');
      }
    });
  });
  
  app.get('/singlestud', (req, res) => {
    // Set the file path
    const file_path1 = path.join(__dirname,"../public/csv/studformat.csv");
    
    // Send the file as an attachment
    res.download(file_path1, 'studformat.csv', (err) => {
      if (err) {
        // Handle errors, such as file not found
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      } else {
        // File downloaded successfully
        console.log('File downloaded successfully');
      }
    });
  });

  app.get('/singlecc', (req, res) => {
    // Set the file path
    const file_path2 = path.join(__dirname,"../public/csv/ccformat.csv");
    
    // Send the file as an attachment
    res.download(file_path2, 'ccformat.csv', (err) => {
      if (err) {
        // Handle errors, such as file not found
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      } else {
        // File downloaded successfully
        console.log('File downloaded successfully');
      }
    });
  });
app.get("/cc", async (req, res) => { // Mark the function as async
    try {
        const ccRequests = await Class_Coordinators.find({});
        console.log(`${ccRequests}`)
        res.render('cc',{ccRequests});
    } catch (error) {
        console.error("Error fetching stud data:", error);
    }
});

app.get("/hod1", async (req, res) => { // Mark the function as async
    try {
        const hodRequests = await Hods.find({});
        console.log(`${hodRequests}`)
        res.render('hod1',{hodRequests});
    } catch (error) {
        console.error("Error fetching stud data:", error);
    }
});
app.post("/studView/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const studOneData = await Students.findOne({crn: scrn});
        console.log(`${studOneData}`)
        res.render("studview",{studOneData});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});
app.post("/ccView/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const ccOneData = await Class_Coordinators.findOne({crn: scrn});
        console.log(`${ccOneData}`)
        res.render("ccview",{ccOneData});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});
app.post("/hodView/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const hodOneData = await Hods.findOne({crn: scrn});
        console.log(`${hodOneData}`)
        res.render("hodview",{hodOneData});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});
app.get("/studadd",async (req, res)=>{
    try {
        res.render("studadd");
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});

app.get("/ccadd",async (req, res)=>{
    try {
        res.render("ccadd");
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});

app.get("/hodadd",async (req, res)=>{
    try {
        res.render("hodadd");
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});
app.post("/studcsv", multer2.single('csvv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const csvv = req.file.path;
        console.log(`${req.file.path}`);

        // Convert CSV to JSON
        const csvData = await csvtojson().fromFile(csvv);
        const hashedCSVData = csvData.map((student) => ({
            ...student,
            password: bcrypt.hashSync(student.password, 10) // Hash password using bcrypt
        }));
        // Insert JSON data into MongoDB
        await Students.insertMany(hashedCSVData);

        // Notify success and render response
        notifier.notify("CSV File Uploaded successfully!");
        const studRequests = await Students.find({});
        console.log(`${studRequests}`);
        res.render('stud', { studRequests });

    } catch (error) {
        console.error("Error uploading CSV file:", error);
        res.status(500).send("Error uploading CSV file");
    }
});

app.post("/cccsv", multer2.single('csvv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const csvv = req.file.path;
        console.log(`${req.file.path}`);

        // Convert CSV to JSON
        const csvData = await csvtojson().fromFile(csvv);
        const hashedCSVData = csvData.map((cc) => ({
            ...cc,
            password: bcrypt.hashSync(cc.password, 10) // Hash password using bcrypt
        }));
        // Insert JSON data into MongoDB
        await Class_Coordinators.insertMany(hashedCSVData);

        // Notify success and render response
        notifier.notify("CSV File Uploaded successfully!");
        const ccRequests = await Class_Coordinators.find({});
        console.log(`${ccRequests}`);
        res.render('cc', { ccRequests });

    } catch (error) {
        console.error("Error uploading CSV file:", error);
        res.status(500).send("Error uploading CSV file");
    }
});
app.post("/hodcsv", multer2.single('csvv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const csvv = req.file.path;
        console.log(`${req.file.path}`);

        // Convert CSV to JSON
        const csvData = await csvtojson().fromFile(csvv);
        const hashedCSVData = csvData.map((hod) => ({
            ...hod,
            password: bcrypt.hashSync(hod.password, 10) // Hash password using bcrypt
        }));
        // Insert JSON data into MongoDB
        await Hods.insertMany(hashedCSVData);

        // Notify success and render response
        notifier.notify("CSV File Uploaded successfully!");
        const hodRequests = await Hods.find({});
        console.log(`${hodRequests}`);
        res.render('hod1', { hodRequests });

    } catch (error) {
        console.error("Error uploading CSV file:", error);
        res.status(500).send("Error uploading CSV file");
    }
});
app.post("/studadd", multer1.single('profile'), async (req, res) => { // Mark the function as async
    try {
        
        const scrn = req.body.crn;
        console.log(`${scrn}`);
        const roll = req.body.roll;
        console.log(`${roll}`);
        const name = req.body.name;
        console.log(`${name}`);
        const department = req.body.department;
        console.log(`${department}`);
        const cc = req.body.cc;
        console.log(`${cc}`);
        const clss = req.body.class;
        console.log(`${clss}`);
        const div = req.body.div;
        console.log(`${div}`);
        const mobile = req.body.mobile;
        console.log(`${mobile}`);
        const email = req.body.email;
        console.log(`${email}`);
        const address = req.body.address;
        console.log(`${address}`);
        const netatt = req.body.netatt;
        console.log(`${netatt}`);
        const pratt = req.body.pratt;
        console.log(`${pratt}`);
        const thatt = req.body.thatt;
        console.log(`${thatt}`);
        const shod = req.body.shod;
        console.log(`${shod}`);
        const sdean = req.body.sdean;
        console.log(`${sdean}`);
        const admissionyear = req.body.ady;
        console.log(`${admissionyear}`);
        console.log(`${req.file.path}`);
        const proof = req.file.path.replace(/\\/g, '/');
        console.log(`${proof}`);
       
        const studRequest = new Students({
            crn: scrn,
            Roll: roll,
            name: name,
            NetAttendace: netatt,
            class: clss,
            div:div,
            CurrentDean:sdean,
            Department:department,
            CurrentHod:shod,
            mobile: mobile,
            CurrentCC: cc,
            email: email,
            ThAttendance: thatt,
            PrAttendance: pratt,
            Address: address,
            profilephoto: proof,
            AdmissionYear: admissionyear,
            password: req.body.pass,
            cccrn: req.body.ccrn
        });

        await studRequest.save();
        notifier.notify("Student data added successfully!");
        const studRequests = await Students.find({});
        console.log(`${studRequests}`)
        res.render('stud',{studRequests});

    } catch (error) {
        console.error("Error submitting CW request:", error);
        res.status(500).send("Error submitting CW request");
    }
});
app.post("/ccadd", multer1.single('profile'), async (req, res) => { // Mark the function as async
    try {
        
        const scrn = req.body.crn;
        console.log(`${scrn}`);
        const name = req.body.name;
        console.log(`${name}`);
        const department = req.body.department;
        console.log(`${department}`);
        const clss = req.body.class;
        console.log(`${clss}`);
        const mobile = req.body.mobile;
        console.log(`${mobile}`);
        const email = req.body.email;
        console.log(`${email}`);
        console.log(`${req.file.path}`);
        const proof = req.file.path.replace(/\\/g, '/');
        console.log(`${proof}`);
       
        const ccRequest = new Class_Coordinators({
            crn: scrn,
            password:req.body.pass,
            name: name,
            class: clss,
            department:department,
            mobile: mobile,
            email: email,
            profilephoto: proof
        });

        await ccRequest.save();
        notifier.notify("Class Coordinator data added successfully!");
        const ccRequests = await Class_Coordinators.find({});
        console.log(`${ccRequests}`)
        res.render('cc',{ccRequests});

    } catch (error) {
        console.error("Error submitting CW request:", error);
        res.status(500).send("Error submitting CW request");
    }
});
app.post("/hodadd", multer1.single('profile'), async (req, res) => { // Mark the function as async
    try {
        
        const scrn = req.body.crn;
        console.log(`${scrn}`);
        const name = req.body.name;
        console.log(`${name}`);
        const department = req.body.department;
        console.log(`${department}`);
        const mobile = req.body.mobile;
        console.log(`${mobile}`);
        const email = req.body.email;
        console.log(`${email}`);
        console.log(`${req.file.path}`);
        const proof = req.file.path.replace(/\\/g, '/');
        console.log(`${proof}`);
       
        const hodRequest = new Hods({
            crn: scrn,
            password:req.body.pass,
            name: name,
            department:department,
            mobile: mobile,
            email: email,
            profilephoto: proof
        });

        await hodRequest.save();
        notifier.notify("Class Coordinator data added successfully!");
        const hodRequests = await Hods.find({});
        console.log(`${hodRequests}`)
        res.render('hod1',{hodRequests});

    } catch (error) {
        console.error("Error submitting CW request:", error);
        res.status(500).send("Error submitting CW request");
    }
});
app.post("/studUpdate1/:scrn", async (req, res) => {
    try {
        const scrn = req.params.scrn;
        const roll = req.body.roll;
        const name = req.body.name;
        const department = req.body.department;
        const cc = req.body.cc;
        const clss = req.body.class;
        const div = req.body.div;
        const mobile = req.body.mobile;
        const email = req.body.email;
        const address = req.body.address;
        const netatt = req.body.netatt;
        const pratt = req.body.pratt;
        const thatt = req.body.thatt;
        const shod = req.body.shod;
        const sdean = req.body.sdean;

        const studUpdateData = await Students.updateOne(
            { crn: scrn },
            {
                $set: {
                    email: email,
                    class: clss,
                    div: div,
                    Department: department,
                    CurrentCC: cc,
                    CurrentHod: shod,
                    CurrentDean: sdean,
                    name: name,
                    Roll: roll,
                    NetAttendace: netatt,
                    PrAttendance: pratt,
                    ThAttendance: thatt,
                    Address: address,
                    mobile: mobile
                }
            }
        );

        console.log(studUpdateData);

        if (studUpdateData.modifiedCount === 0) {
            console.log("No document found to update.");
            return res.status(404).send("No document found to update.");
        }

        notifier.notify("Data Successfully Updated!!");
        const studRequests = await Students.find({});
        console.log(`${studRequests}`)
        res.render('stud',{studRequests});
    } catch (error) {
        console.error("Error fetching stud data", error);
        res.status(500).send("Error updating stud data");
    }
});

app.post("/ccUpdate1/:scrn", async (req, res) => {
    try {
        const scrn = req.params.scrn;
        const name = req.body.name;
        const department = req.body.department;
        const clss = req.body.class;
        const mobile = req.body.mobile;
        const email = req.body.email;

        const ccUpdateData = await Class_Coordinators.updateOne(
            { crn: scrn },
            {
                $set: {
                    email: email,
                    class: clss,
                    department: department,
                    name: name,
                    mobile: mobile
                }
            }
        );

        console.log(ccUpdateData);

        if (ccUpdateData.modifiedCount === 0) {
            console.log("No document found to update.");
            return res.status(404).send("No document found to update.");
        }

        notifier.notify("Data Successfully Updated!!");
        const ccRequests = await Class_Coordinators.find({});
        console.log(`${ccRequests}`)
        res.render('cc',{ccRequests});
    } catch (error) {
        console.error("Error fetching stud data", error);
        res.status(500).send("Error updating stud data");
    }
});
app.post("/hodUpdate1/:scrn", async (req, res) => {
    try {
        const scrn = req.params.scrn;
        const name = req.body.name;
        const department = req.body.department;
        const mobile = req.body.mobile;
        const email = req.body.email;

        const hodUpdateData = await Hods.updateOne(
            { crn: scrn },
            {
                $set: {
                    email: email,
                    department: department,
                    name: name,
                    mobile: mobile
                }
            }
        );

        console.log(hodUpdateData);

        if (hodUpdateData.modifiedCount === 0) {
            console.log("No document found to update.");
            return res.status(404).send("No document found to update.");
        }

        notifier.notify("Data Successfully Updated!!");
        const hodRequests = await Hods.find({});
        console.log(`${hodRequests}`)
        res.render('hod1',{hodRequests});
    } catch (error) {
        console.error("Error fetching stud data", error);
        res.status(500).send("Error updating stud data");
    }
});
app.post("/studUpdate/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const studOneData = await Students.findOne({crn: scrn});
        console.log(`${studOneData}`)
        res.render("studUpdate",{studOneData});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});

app.post("/hodUpdate/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const hodOneData = await Hods.findOne({crn: scrn});
        console.log(`${hodOneData}`)
        res.render("hodUpdate",{hodOneData});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});

app.post("/ccUpdate/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const ccOneData = await Class_Coordinators.findOne({crn: scrn});
        console.log(`${ccOneData}`)
        res.render("ccUpdate",{ccOneData});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});

app.post("/studDelete/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const studDelData = await Students.deleteOne({crn:scrn});
        console.log(`${studDelData}`);
        notifier.notify(`Data Deleted!!`);
        const studRequests = await Students.find({});
        console.log(`${studRequests}`)
        res.render('stud',{studRequests});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});
app.post("/hodDelete/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const hodDelData = await Hods.deleteOne({crn:scrn});
        console.log(`${hodDelData}`);
        notifier.notify(`Data Deleted!!`);
        const hodRequests = await Hods.find({});
        console.log(`${hodRequests}`)
        res.render('hod1',{hodRequests});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});
app.post("/ccDelete/:scrn",async (req, res)=>{
    try {
        const scrn = req.params.scrn;
        console.log(`${scrn}`);
        const ccDelData = await Class_Coordinators.deleteOne({crn:scrn});
        console.log(`${ccDelData}`);
        notifier.notify(`Data Deleted!!`);
        const ccRequests = await Class_Coordinators.find({});
        console.log(`${ccRequests}`)
        res.render('cc',{ccRequests});
    } catch (error) {
        console.error("Error fetching stud data", error);
    }
});
app.get("/granted_cws",(req, res)=>{
    res.render("granted_cws");
});
app.post("/granted_cwss",async (req, res)=>{
    try {
        const dept = req.body.dept;
        const classroom = req.body.classroom;
        const division = req.body.division;
        const cwRequests = await Cws.find({
            $and:[
            {sect: division},
            {cy: classroom},
            {department: dept},
            {reviwedByCC: 'accepted'},
            {reviwedByHod: 'accepted'},
            {reviwedBYDean: 'accepted'},
            ]
        });
        console.log(cwRequests);
        
        res.render("granted_cws",{cwData:cwRequests});
    } catch (error) {
       
    }
    

});
app.post("/statistics", async (req, res) => {
    try {
        const weeklyReports = await WeeklyReport.find(); // Fetch all documents from the weeklyreport collection
        const data = {
            xValues: weeklyReports.map((report, index) => `${index + 1}`).join(','), // Generate x values
            yValues: weeklyReports.map(report => report.cwRequestsCount) // Generate y values
        };
        const data2 = await pieReport.findOne({numid: 1});
        console.log(`${data2}`);
        res.render("statistics", {data, data2});
    } catch (error) {
        // Handle error
    }
});


app.get("/forgot_pass", (req, res) => {
    res.render("forgot_pass"); // Assuming you have a forgot_pass.hbs file in your views directory
});



app.post("/crudop", async(req, res)=>{
    try {
        res.render("crudop"); 

    } catch (error) {
        notifier.notify(`Something went wrong!!`);
    }
});
app.get("/login", (req, res) => {
    res.render("login"); // Assuming you have a forgot_pass.hbs file in your views directory
});


app.post("/approve/:srno", async(req, res)=>{
    try {
        const srnos = req.params.srno;
        const cwRequestss = await Cws.findOne({srno: srnos});
        console.log(`gbfhchjs`);
        console.log(`${cwRequestss}`);
        console.log(`${cwRequestss.proof}`);
        var proofs = cwRequestss.proof;
        res.render("approval_page",{srnorequest:cwRequestss, proofs});

    } catch (error) {
        notifier.notify(`Something went wrong!!`);
    }
});

app.post("/accept/:srno", async (req, res) => {
    try {
        const srno = req.params.srno;
        const action = req.body.action; // action is either 'approve' or 'reject'
        let hodEmail, deanEmail;
        const cwRequest = await Cws.findOne({ srno: srno });
        console.log(`${cwRequest.reviwedByDean}`);
        if (
            cwRequest.reviwedByCC === "pending" &&
            cwRequest.reviwedByHod === "pending" &&
            cwRequest.reviwedBYDean === "pending"
        ){
            console.log(`${cwRequest.reviewedByCC}`);
            const update = action === 'approve' ?  'accepted' : 'pending' ;

        // Update the document in the MongoDB collection
        const result = await Cws.updateOne({ srno: srno }, {$set:{reviwedByCC: update}});
        console.log('Update result:', result);
        const hod = await Hods.findOne({ department: cwRequest.department });
        hodEmail = hod.email;
        console.log(`hod Email: ${hodEmail}`);
        var mailOptions = {
            from: 'classsworks@gmail.com',
            to: hodEmail,
            subject: 'Requesting Classwork',
            html: `<h1>You have recieved a classwork request from <b>${cwRequest.studcrn}:${cwRequest.name}</b><br/>Please <a href="/hodmailrender/${hodEmail}">Click here</a> to view status</h1>`, // html body
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log('Email Sent: ' + info.response);
            }
        });
        // Redirect back to the admin page
        const usercrn = await Class_Coordinators.findOne({crn:cwRequest.cccrn});
            ccrn = usercrn;
            const userInitial = usercrn.name.charAt(0);
            const cwRequests = await Cws.find({
                $and:[
                {currentcc: ccrn.name,},
                {reviwedByCC: 'pending'},
                {reviwedByHod: 'pending'},
                {reviwedBYDean: 'pending'},
                ]
            });
            if(usercrn){
                res.status(201).render("admin",{ccData: usercrn,ccRequests: cwRequests, ui: userInitial});  
        }
        notifier.notify("Approved");  // Replace '/admin' with the actual route to the admin page

        }
        else if(
            cwRequest.reviwedByCC === "accepted" &&
            cwRequest.reviwedByHod === "pending" &&
            cwRequest.reviwedBYDean === "pending"
        ){
            const update = action === 'approve' ?  'accepted' : 'pending' ;

        // Update the document in the MongoDB collection
        const result = await Cws.updateOne({ srno: srno }, {$set:{reviwedByHod: update}});
        console.log('Update result:', result);
        deanEmail = "rsthakur371123@kkwagh.edu.in";
        var mailOptions = {
            from: 'classsworks@gmail.com',
            to: deanEmail,
            subject: 'Requesting Classwork',
            html: `<h1>You have recieved a classwork request from <b>${cwRequest.studcrn}</b><br/>Please <a href="/deanmailrender/${deanEmail}">Click here</a> to view status</h1>`
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log('Email Sent: ' + info.response);
            }
        });
        // Redirect back to the admin page
        notifier.notify("Approved"); // Replace '/admin' with the actual route to the admin page
        const usercrn = await Hods.findOne({department:cwRequest.department});
            hcrn = usercrn;
            const userInitial = usercrn.name.charAt(0);
            //const cwRequests = await Cws.find({department: hcrn.department});
            const cwRequests = await Cws.find({
                $and:[
                {department: hcrn.department},
                {reviwedByCC: 'accepted'},
                {reviwedByHod: 'pending'},
                {reviwedBYDean: 'pending'},
                ]
            });
            
            if(usercrn){
                res.status(201).render("hod",{hodData: usercrn,hodRequests: cwRequests, ui: userInitial});
            }
        }
        else if(
            cwRequest.reviwedByCC === "accepted" &&
            cwRequest.reviwedByHod === "accepted" &&
            cwRequest.reviwedBYDean === "pending"
        ){
            const update = action === 'approve' ?  'accepted' : 'pending' ;

        // Update the document in the MongoDB collection
        const result = await Cws.updateOne({ srno: srno }, {$set:{reviwedBYDean: update}});
        console.log('Update result:', result);
        // Redirect back to the admin page
        console.log(`${cwRequest.studemail}`);
        var mailOptions = {
            from: 'classsworks@gmail.com',
            to: cwRequest.studemail,
            subject: 'Classwork Grant',
            html: `<h1>Congratulations!!!Your class work request has been accepted for date <b>${cwRequest.dateofdeparture}</b><br/>Please <a href="/studmailrender/${cwRequest.studemail}">Click here</a> to view status</h1>`
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log('Email Sent: ' + info.response);
            }
        });
        notifier.notify("Approved");// Replace '/admin' with the actual route to the admin page
        const usercrn = await Deans.findOne({crn:3722113006});
            dcrn = usercrn;
            const userInitial = usercrn.name.charAt(0);
            const cwRequests = await Cws.find({
                $and:[
                {currentdean: dcrn.name},
                {reviwedByCC: 'accepted'},//3722113006 12345
                {reviwedByHod: 'accepted'},
                {reviwedBYDean: 'pending'},
                ]
            });
            
            if (action === 'approve') {
                const result = await pieReport.updateOne({
                    numid: 1
                }, {
                    $inc: {
                        allaccepted: 1
                    }
                });
                const result1 = await pieReport.updateOne({
                    numid: 1
                }, {
                    $inc: {
                        allpending: -1
                    }
                });
                console.log(`${result} ${result1}`);
                //await pieReport.updateOne({}, { $inc: { accepted: 1 } });
            }
            //const cwRequests = await Cws.find({reviwedByCC:"accepted",reviwedByHod:"accepted",reviwedByDean:"pending"});
            if(usercrn){
                res.status(201).render("dean",{deanData: usercrn, deanRequests:cwRequests, ui: userInitial});
            }
        }
        // Update the document in the MongoDB collection based on the action
        
    } catch (error) {
        console.error("Error updating review status:", error);
        notifier.notify(`Something went wrong!!`);
       
    }
});

app.post("/reject/:srno", async (req, res) => {

    try {
        const srno = req.params.srno;
        const action = req.body.action; // action is either 'approve' or 'reject'
        if (action === 'reject') {
            const result = await pieReport.updateOne({
                numid: 1
            }, {
                $inc: {
                    allrejected: 1
                }
            });
            const result1 = await pieReport.updateOne({
                numid: 1
            }, {
                $inc: {
                    allpending: -1
                }
            });
            console.log(`${result} ${result1}`);
        } 
        const cwRequest = await Cws.findOne({ srno: srno });
        console.log(`${cwRequest.reviwedBYDean}`);
        if (
            cwRequest.reviwedByCC === "pending" &&
            cwRequest.reviwedByHod === "pending" &&
            cwRequest.reviwedBYDean === "pending"
        ){
        console.log(`${cwRequest.reviwedByCC}`);
        // Update the document in the MongoDB collection based on the action
        const rejectnote = req.body.userNote;
        const update = action === 'reject' ?  'rejected' : 'pending' ;
        
        // Update the document in the MongoDB collection
        const result = await Cws.updateOne({ srno: srno }, {$set:{reviwedByCC: update}});
        console.log('Update result:', result);
        var mailOptions = {
            from: 'classsworks@gmail.com',
            to: cwRequest.studemail,
            subject: 'Classwork Rejected',
            html: `<h1>Sorry!!!Your class work request has been declined for date <b>${cwRequest.dateofdeparture}</b> <br/>Reason: <b>${rejectnote}</b><br/>Please <a href="/studmailrender/${cwRequest.studemail}">Click here</a> to view status</h1>`
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log('Email Sent: ' + info.response);
            }
        });
        // Redirect back to the admin page
        notifier.notify("Rejected");
        const usercrn = await Class_Coordinators.findOne({crn:cwRequest.cccrn});
            ccrn = usercrn;
            const userInitial = usercrn.name.charAt(0);
            const cwRequests = await Cws.find({
                $and:[
                {currentcc: ccrn.name,},
                {reviwedByCC: 'pending'},
                {reviwedByHod: 'pending'},
                {reviwedBYDean: 'pending'},
                ]
            });
            if(usercrn){
                res.status(201).render("admin",{ccData: usercrn,ccRequests: cwRequests, ui: userInitial});  
        } // Replace '/admin' with the actual route to the admin page
        }
        else if(
            cwRequest.reviwedByCC === "accepted" &&
            cwRequest.reviwedByHod === "pending" &&
            cwRequest.reviwedBYDean === "pending"
        ){
            const rejectnote = req.body.userNote;
            const update = action === 'reject' ?  'rejected' : 'pending' ;

        // Update the document in the MongoDB collection
        const result = await Cws.updateOne({ srno: srno }, {$set:{reviwedByHod: update}});
        console.log('Update result:', result);
        //var note1 = window.prompt("Enter a note to reject application: ");
        // Redirect back to the admin page
        var mailOptions = {
            from: 'classsworks@gmail.com',
            to: cwRequest.studemail,
            subject: 'Classwork Rejected',
            html: `<h1>Sorry!!!Your class work request has been declined for date <b>${cwRequest.dateofdeparture}</b> <br/>Reason: <b>${rejectnote}</b><br/>Please <a href="/studmailrender/${cwRequest.studemail}">Click here</a> to view status</h1>`
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{

                console.log('Email Sent: ' + info.response);
            }
        });
        notifier.notify("Rejected");// Replace '/admin' with the actual route to the admin page
        const usercrn = await Hods.findOne({department:cwRequest.department});
            hcrn = usercrn;
            const userInitial = usercrn.name.charAt(0);
            //const cwRequests = await Cws.find({department: hcrn.department});
            const cwRequests = await Cws.find({
                $and:[
                {department: hcrn.department},
                {reviwedByCC: 'accepted'},
                {reviwedByHod: 'pending'},
                {reviwedBYDean: 'pending'},
                ]
            });
            
            if(usercrn){
                res.status(201).render("hod",{hodData: usercrn,hodRequests: cwRequests, ui: userInitial});
            }
        }
        else if(
            cwRequest.reviwedByCC === "accepted" &&
            cwRequest.reviwedByHod === "accepted" &&
            cwRequest.reviwedBYDean === "pending"
        ){
            const rejectnote = req.body.userNote;
            const update = action === 'reject' ?  'rejected' : 'pending' ;

        // Update the document in the MongoDB collection
        const result = await Cws.updateOne({ srno: srno }, {$set:{reviwedBYDean: update}});
        console.log('Update result:', result);
         var mailOptions = {
            from: 'classsworks@gmail.com',
            to: cwRequest.studemail,
            subject: 'Classwork Rejected',
            html: `<h1>Sorry!!!Your class work request has been declined for date <b>${cwRequest.dateofdeparture}</b> <br/>Reason: <b>${rejectnote}</b><br/>Please <a href="/studmailrender/${cwRequest.studemail}">Click here</a> to view status</h1>`
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log('Email Sent: ' + info.response);
            }
        });

        // Redirect back to the admin page
        notifier.notify("Rejected");// Replace '/admin' with the actual route to the admin page
        const usercrn = await Deans.findOne({crn:3722113006});
            dcrn = usercrn;
            const userInitial = usercrn.name.charAt(0);
            const cwRequests = await Cws.find({
                $and:[
                {currentdean: dcrn.name},
                {reviwedByCC: 'accepted'},//3722113006 12345
                {reviwedByHod: 'accepted'},
                {reviwedBYDean: 'pending'},
                ]
            });
            //const cwRequests = await Cws.find({reviwedByCC:"accepted",reviwedByHod:"accepted",reviwedByDean:"pending"});
            if(usercrn){
                res.status(201).render("dean",{deanData: usercrn, deanRequests:cwRequests, ui: userInitial});
            }
        }
        // Update the document in the MongoDB collection based on the action
        
    } catch (error) {
        console.error("Error updating review status:", error);
        notifier.notify(`Something went wrong!!`);
        
    }
});
app.get("/studmailrender/:mailid",async (req, res)=>{
    const mailid = req.params.mailid;
    const stud = await Students.findOne({ email: mailid });
    const userInitial = cc.name.charAt(0);
    res.status(201).render("profilepage",{userData: stud, ui: userInitial});         
});

app.get("/ccmailrender/:mailid",async (req, res)=>{
    const mailid = req.params.mailid;
    const cc = await Class_Coordinators.findOne({ email: mailid });
    const userInitial = cc.name.charAt(6);
    const cwRequests = await Cws.find({
        $and:[
        {currentcc: cc.name,},
        {reviwedByCC: 'pending'},
        {reviwedByHod: 'pending'},
        {reviwedBYDean: 'pending'},
        ]
    });
    res.status(201).render("admin",{ccData: cc,ccRequests: cwRequests, ui: userInitial});

});

app.get("/hodmailrender/:mailid",async (req, res)=>{
    const mailid = req.params.mailid;
    const hod = await Hods.findOne({ email: mailid });
    const userInitial = hod.name.charAt(10);
    const cwRequests = await Cws.find({
        $and:[
        {department: hod.department},
        {reviwedByCC: 'accepted'},
        {reviwedByHod: 'pending'},
        {reviwedBYDean: 'pending'},
        ]
    });
    res.status(201).render("hod",{hodData: hod,hodRequests: cwRequests, ui: userInitial});

});

app.get("/deanmailrender/:mailid",async (req, res)=>{
    const mailid = req.params.mailid;
    const dean = await Deans.findOne({ email: mailid });
    const userInitial = dean.name.charAt(10);
    const cwRequests = await Cws.find({
        $and:[
        {currentdean: dean.name},
        {reviwedByCC: 'accepted'},
        {reviwedByHod: 'accepted'},
        {reviwedBYDean: 'pending'},
        ]
    });
    res.status(201).render("dean",{deanData: dean,deanRequests: cwRequests, ui: userInitial});

});


//login check
app.post("/login", async (req, res)=>{
    try{
        const userType = req.body.userType;
        const crn = req.body.crn;
        const pass = req.body.password;
        console.log(`${userType} ${crn} ${pass} `);
        if(userType=="admin"){
            const usercrn = await Deans.findOne({crn:crn});
            dcrn = usercrn;
            const userInitial = usercrn.name.charAt(10);
            const cwRequests = await Cws.find({
                $and:[
                {currentdean: dcrn.name},
                {reviwedByCC: 'accepted'},//3722113006 12345
                {reviwedByHod: 'accepted'},
                {reviwedBYDean: 'pending'},
                ]
            });
            const passwordhash = await bcrypt.compare(pass, usercrn.password);
            //const cwRequests = await Cws.find({reviwedByCC:"accepted",reviwedByHod:"accepted",reviwedByDean:"pending"});
            if(usercrn){
            if(passwordhash){
                console.log(`${pass} ${usercrn.password}`)
                res.status(201).render("dean",{deanData: usercrn, deanRequests:cwRequests, ui: userInitial});
            }else{
                notifier.notify(`Invalid Credentials `);
            }}
        }
        else if(userType=="hod"){
            const usercrn = await Hods.findOne({crn:crn});
            hcrn = usercrn;
            const userInitial = usercrn.name.charAt(10);
            //const cwRequests = await Cws.find({department: hcrn.department});
            const cwRequests = await Cws.find({
                $and:[
                {department: hcrn.department},
                {reviwedByCC: 'accepted'},
                {reviwedByHod: 'pending'},
                {reviwedBYDean: 'pending'},
                ]
            });
            /*const filteredCwRequests = cwRequests.filter(request => {
                return cwRequests.reviwedByCC === "accepted" && 
                       cwRequests.reviwedByHod === "pending" && 
                       cwRequests.reviwedByDean === "pending";
            });*/
            //const cwRequests = await Cws.find({ $and: [ { department: hcrn.department}, {reviwedByCC:"accepted"}, {reviwedByHod:"pending"}, {reviwedByDean:"pending"} ] });
            const passwordhash = await bcrypt.compare(pass, usercrn.password);
            if(usercrn){
            if(passwordhash){
                console.log(`${pass} ${usercrn.password} ${cwRequests}`)
                res.status(201).render("hod",{hodData: usercrn,hodRequests: cwRequests, ui: userInitial});
            }else{
                notifier.notify(`Invalid Credentials `);
            }
        }
        }
        else if(userType=="cc"){
            const usercrn = await Class_Coordinators.findOne({crn:crn});
            ccrn = usercrn;
            const userInitial = usercrn.name.charAt(6);
            const cwRequests = await Cws.find({
                $and:[
                {currentcc: ccrn.name,},
                {reviwedByCC: 'pending'},
                {reviwedByHod: 'pending'},
                {reviwedBYDean: 'pending'},
                ]
            });
            const passwordhash = await bcrypt.compare(pass, usercrn.password);
            if(usercrn){
            if(passwordhash){
                console.log(`${pass} ${usercrn.password} ${cwRequests}`)
                res.status(201).render("admin",{ccData: usercrn,ccRequests: cwRequests, ui: userInitial});
            }else{
                notifier.notify(`Invalid Credentials `);
            }
        }
        }
        else if(userType=="student"){
            const usercrn = await Students.findOne({crn:crn});
            ucrn = usercrn;
            const userInitial = usercrn.name.charAt(0);
            console.log(`${usercrn} ${usercrn.password} ${usercrn.profilephoto}`)
            const passwordhash = await bcrypt.compare(pass, usercrn.password);
            if(usercrn){
                if(passwordhash){
                    console.log(`${pass} ${usercrn.password} ${usercrn.profilephoto}`)
                    res.status(201).render("profilepage",{userData: usercrn, ui: userInitial});     
                }else{
                    notifier.notify(`Invalid Credentials `);
                }
            }
            
        }
        else if(userType=="madmin"){
            const usercrn = await Madmin.findOne({crn:crn});
            ucrn = usercrn;
            console.log(`${usercrn}`);
            const userInitial = usercrn.name.charAt(0);
            console.log(`${usercrn} ${usercrn.password}`);
            const passwordhash = await bcrypt.compare(pass, usercrn.password);
            if(usercrn){
                if(passwordhash){
                    console.log(`${pass} ${usercrn.password}`)
                    res.status(201).render("crudop",{userData: usercrn, ui: userInitial});     
                }else{
                    notifier.notify(`Invalid Credentials `);
                }
            }   
        }
        //const usercrn = await Students.findOne({crn:crn});
        
        //res.send(usercrn);
        //console.log(usercrn);
        //const userpass = await Students.findOne({password:pass});
        //res.render("profilepage");
        

    }catch(error){
        
       notifier.notify(`Invalid Credentials `);
        
    }
});

cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly cron job');
    try {
        // Calculate the start and end of the previous week
        const today = new Date();
        const startOfLastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 6);
        const endOfLastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 1);

        const numberOfDocuments = await Cws.find({
            createdAt: {
                $gte: startOfLastWeek,
                $lte: endOfLastWeek
            }
        }).countDocuments();

        console.log(numberOfDocuments);
        const newweeklyreport = new WeeklyReport({
            cwRequestsCount: numberOfDocuments, weekStartDate: startOfLastWeek, weekEndDate: endOfLastWeek
        });

        await newweeklyreport.save();
        // Insert the count into the weeklyreport collection
        //await WeeklyReport.insertOne({ numberOfDocuments, startDate: startOfLastWeek, endDate: endOfLastWeek });

        console.log('Weekly cron job executed successfully');
    } catch (error) {
        console.error('Error occurred:', error);
    }
    // Put your code to run after each week here
  }, {
    timezone: "Asia/Kolkata" // Specify your timezone here, e.g., "America/New_York"
  });


app.get("/application", (req, res) => {
    const startOfWeek = moment().startOf('week').toDate();
    console.log(`${startOfWeek}`)
    if(ucrn.NetAttendace >= 75){
        res.status(201).render("application",{userData: ucrn}); // Assuming you have a application.hbs file in your views directory
    }
    
});



app.get("/notifall/:scrn", async (req, res) => { // Mark the function as async
    try {
        // Retrieve the necessary data from the cw_requests collection
        //const cwRequests = await Cws.find({ studcrn: ucrn.crn });
        const ccrn = req.params.scrn;
        const cwRequest1 = await Cws.find({ studcrn: ccrn }).sort({ createdAt: -1 });

        res.render('notifall',{cwreq:cwRequest1});

    } catch (error) {
        console.error("Error submitting CW request:", error);
    }
});
app.get("/notif/:srno", async (req, res) => { // Mark the function as async
    try {
        // Retrieve the necessary data from the cw_requests collection
        //const cwRequests = await Cws.find({ studcrn: ucrn.crn });
        const srno = req.params.srno;
        const cwRequest1 = await Cws.findOne({ srno: srno });

        res.render('notif',{cwreq:cwRequest1});

    } catch (error) {
        console.error("Error submitting CW request:", error);
    }
});
var oemail;
app.post("/otp_enter", async (req, res) => { // Mark the function as async
    try {
        oemail = req.body.email;
        console.log(oemail);
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log(otp);
        
          var crn;
          var mainuser;
          var userType;
          //console.log(crn);
          const userstud = await Students.findOne({email: oemail});
          if(!userstud){
            const usercc = await Class_Coordinators.findOne({email: oemail});
            if(!usercc){
                const userhod = await Hods.findOne({email: oemail});
                if(!userhod){
                const userdean = await Deans.findOne({email: oemail});
                if(!userdean){
                const useradmin = await Admin.findOne({email: oemail});
                if(!useradmin){
                    notifier.notify("User with provided email id not found")
                }else{
                    mainuser = useradmin;
                    userType="admin";
                    crn = useradmin.crn; 
                }
                }else{
                    mainuser = userdean;
                    userType="dean";
                    crn = userdean.crn;
                }
                }else{
                    mainuser = userhod;
                    userType="hod";
                    crn = userhod.crn;
                }
            }else{
                mainuser = usercc;
                userType="cc";
                crn = usercc.crn;
            }
          }else{
            mainuser = userstud;
            userType="student";
            crn = userstud.crn;
          }
          if(!crn){
            
          }else{
            var mailOptions = {
                from: 'classsworks@gmail.com',
                to: oemail,
                subject: 'Your OTP',
                html: `<h1>OTP: <b>${otp}</b></h1>`, // html body
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
          const pwdReset = new Pwdreset({crn:crn, email: oemail, otp: otp });
          await pwdReset.save();
          res.render('otpenter',{oemail,otp,userType,mainuser});
          }

    } catch (error) {
        console.error("Error submitting CW request:", error);
        notifier.notify("OTP already Sent to provided email id");
    }
});
app.post("/verifyOtp", async (req, res) => { // Mark the function as async
    try {
        const clotp = req.body.otp;
        const emailo = req.body.email;
        const userType = req.body.usert;
        
        console.log(`${clotp}${emailo}`);

        // Retrieve the document with the provided email and OTP
        const pwdReset = await Pwdreset.findOne({ email: emailo, otp: clotp });
        if (pwdReset) {
            // If the document is found, delete it and redirect to the password reenter page
            await Pwdreset.deleteOne({ _id: pwdReset._id });
            res.render('password_reenter',{emailo,userType});
        } else {
            // If no document is found, redirect to the login page
            res.render('login');
        }
    } catch (error) {
        console.error("Error submitting CW request:", error);
        res.status(500).send("Error submitting CW request");
    }
});
app.post("/password_change", async (req, res) => { // Mark the function as async
    try {
        const newp = req.body.newp;
        const conp = req.body.conp;
        const emailp = req.body.email;
        const userType = req.body.usert;
        console.log(`${newp}${conp}${emailp}`);
        /*  
        const securePassword = async (password)=>{
        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash);
        }

        securePassword("Rasika@303");
        */
        var result;
        if(newp===conp){
            const passwordHash = await bcrypt.hash(newp, 10);
            if(userType=="student"){
                 result = await Students.updateOne({ email: emailp }, {$set:{password: passwordHash}});
                notifier.notify("Password Changed Successfully!");
            }else if(userType=="cc"){
                 result = await Class_Coordinators.updateOne({ email: emailp }, {$set:{password: passwordHash}});
                notifier.notify("Password Changed Successfully!");
            }else if(userType=="hod"){
                 result = await Hods.updateOne({ email: emailp }, {$set:{password: passwordHash}});
                notifier.notify("Password Changed Successfully!");
            }else if(userType=="dean"){
                 result = await Deans.updateOne({ email: emailp }, {$set:{password: passwordHash}});
                notifier.notify("Password Changed Successfully!");
            }else if(userType=="admin"){
                 result = await Admin.updateOne({ email: emailp }, {$set:{password: passwordHash}});
                notifier.notify("Password Changed Successfully!");
            }
            res.render('login');
        }else{
            notifier.notify("New Password and Confirm Password does not match!");
        }
       
    } catch (error) {
        console.error("Error submitting CW request:", error);
        res.status(500).send("Error submitting CW request");
    }
});
const counterSchema={
    id:{
        type:String
    },
    seq:{
        type:Number
    }
}
const counterModel=new mongoose.model("counter", counterSchema);

app.post("/notif", multer.singleWithDeletion('proof'), async (req, res) => { // Mark the function as async
    try {
        const departure = req.body.departure;
        console.log(`${departure}`);
        console.log(`${ucrn.crn} ${ucrn.CurrentCC} ${ucrn.email} `);
        const returned = req.body.returned;
        console.log(` ${returned} `);
        const reason = req.body.reason;
        console.log(`${reason} `);
        const proof = req.file.path.replace(/\\/g, '/');
        console.log(`${proof}`);
        const cc1 = await Class_Coordinators.findOne({ name: ucrn.CurrentCC });
        console.log(`${cc1.email}`);
        const cd = await counterModel.findOneAndUpdate(
            { id: "autoval" },
            { "$inc": { "seq": 1 } },
            { new: true }
        ).exec();

        let seqId;
        if (cd == null) {
            const newval = new counterModel({ id: "autoval", seq: 1 });
            await newval.save();
            seqId = 1;
        } else {
            seqId = cd.seq;
        }
        const cwRequest = new Cws({
            srno: seqId,
            roll: ucrn.Roll,
            name: ucrn.name,
            netattendance: ucrn.NetAttendace,
            cy: ucrn.class,
            sect:ucrn.div,
            currentdean:ucrn.CurrentDean,
            cccrn:ucrn.cccrn,
            department:ucrn.Department,
            currenthod:ucrn.CurrentHod,
            studcrn: ucrn.crn,
            currentcc: ucrn.CurrentCC,
            studemail: ucrn.email,
            dateofdeparture: departure,
            dateofreturn: returned,
            reason: reason,
            proof: proof,
            profileimage: ucrn.profilephoto,
            cemail: cc1.email
        });

        await cwRequest.save();
        const result = await pieReport.updateOne({
            numid: 1
        }, {
            $inc: {
                allpending: 1
            }
        });
        //const result = await pieReport.updateOne({}, { $inc: { pending: 1 } });

        console.log(`${result}`);
        //await pieReport.updateOne({}, { $inc: { pending: 1 } });
        // Retrieve the necessary data from the cw_requests collection
        const cwRequests = await Cws.find({ studcrn: ucrn.crn });
        const cwRequest1 = await Cws.findOne({ studcrn: ucrn.crn }).sort({ createdAt: -1 }).limit(1);
        const ccEmail = cc1.email;
        console.log(`${ccEmail}`);
        //console.log1(`${ccEmail}`);
        var mailOptions = {
            from: 'classsworks@gmail.com',
            to: ccEmail,
            subject: 'Requesting Classwork',
            html: `<h1>You have recieved a classwork request from <b>${ucrn.crn}${ucrn.name}<b><br/>Please <a href="/ccmailrender/${ccEmail}">Click here</a> to view status</h1>`, // html body
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          res.render('notif',{cwreq:cwRequest1});
        /*var mailOptions = {
            from: 'classsworks@gmail.com',
            to: ccEmail,
            subject: 'Requesting Classwork',
            text: `You have recieved a classwork request from ${cwRequests.studcrn}`
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log('Email Sent: ' + info.response);
            }
        });*/
        // Pass the cwRequests data to the notif.hbs file for rendering
        /* const server = http.createServer((request, response) => {
            const auth = nodemailer.createTransport({
                service: "gmail",
                secure : true,
                port : 465,
                auth: {
                    user: "classsworks@gmail.com",
                    pass: "qbuv lqyd syoi zftr"
        
                }
            });
          const receiver = {
            from : "classsworks@gmail.com",
            to : ccEmail,
            subject : "Requesting Classwork",
            html: `<h1>You have recieved a classwork request from <b>${cwRequests.studcrn}<b><h1>`, // html body
        };
        
        auth.sendMail(receiver, (error, emailResponse) => {
            if(error)
            throw error;
            console.log("success!");
            response.end();
        });
        
        });
        
       if (process.env.START_SERVER === "true") {
            const PORT = process.env.PORT || 8088;
            server.listen(PORT, () => {
                console.log(`Server is listening on port ${PORT}`);
            });
        } else {
            console.log("Server not started. Use environment variable START_SERVER=true to start the server.");
        }
        
        // Export the server object for testing purposes
        module.exports = server;*/
        

    } catch (error) {
        console.error("Error submitting CW request:", error);
        res.status(500).send("Error submitting CW request");
    }
});
/*
$(document).ready(function(){
	var characterTemplate = $("#character-template").html();

	var compiledCharacterTemplate = Handlebars.compile(characterTemplate);

	$.ajax("./data/cast.json").done(function(cast) {
		$(".character-list-container").html(compiledCharacterTemplate(cast));
	});
});*/
app.listen(port, ()=>{
   /*MongoClient.connect("mongodb://0.0.0.0:27017/classworksystem",
        (err,result)=>{
            if(err) throw err
            database = result.db('classworksystem');
            console.log('Connect Success ');
        })*/
    console.log('server running ');
});

/*
const pwdResetSchema = new mongoose.Schema({
    email: String,
    otp: String
});
const PwdReset = mongoose.model('PwdReset', pwdResetSchema, 'pwd_reset'); // Specify collection name
*/
// Middleware to parse URL-encoded and JSON request bodies
