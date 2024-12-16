const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        return cb(null, './public/csv')
    },
    filename: function(req, file, cb){
        let ext = path.extname(file.originalname);
        return cb(null, Date.now() + ext);
    }
});

var uploadcsv = multer({
    storage: storage,
    fileFilter: function(req, file, callback){
        if(file.mimetype == "text/csv")
        {
            callback(null, true)
        }else{
            console.log('only csv files supported!!')
        }
    },
    limits:{
        fileSize: 1024 * 1024 * 200
    }
});

module.exports = uploadcsv;