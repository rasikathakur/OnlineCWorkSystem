/*const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        return cb(null, './public/uploads')
    },
    filename: function(req, file, cb){
        let ext = path.extname(file.originalname);
        return cb(null, Date.now() + ext);
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback){
        if(file.mimetype == "application/pdf" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png")
        {
            callback(null, true)
        }else{
            console.log('only pdf, png, jpeg, jpg files supported!!')
        }
    },
    limits:{
        fileSize: 1024 * 1024 * 200
    }
})

module.exports = upload;


*/
const path = require("path");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const schedule = require('node-schedule');
// Configure Cloudinary
cloudinary.config({
    cloud_name: 'diexk8p7l',
    api_key: '693187359886498',
    api_secret: 'CEnDy6VvJLCRlnyWgHk3jM4QwVE'
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ClassWorkProofs', // Folder name in Cloudinary
        format: async (req, file) => {
            // Supports promises as well
            const ext = path.extname(file.originalname);
            return ext === '.pdf' ? 'pdf' : 'png'; // Set the format for file types
        },
        public_id: (req, file) => Date.now() + path.extname(file.originalname)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (file.mimetype == "application/pdf" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            callback(null, true);
        } else {
            console.log('Only PDF, PNG, JPEG, JPG files are supported!!');
            callback(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 200 // 200MB
    }
});

upload.singleWithDeletion = function (field) {
    return function (req, res, next) {
        upload.single(field)(req, res, function (err) {
            if (err) return next(err);

            // If upload was successful, schedule deletion
            const deleteDate = new Date();
            deleteDate.setSeconds(deleteDate.getSeconds() + 10);

            schedule.scheduleJob(deleteDate, function () {
                cloudinary.uploader.destroy(req.file.public_id, function (error, result) {
                    if (error) {
                        console.log('Deletion Error:', error);
                    } else {
                        console.log('Deletion Success:', result);
                    }
                });
            });

            console.log(`Deletion scheduled for: ${deleteDate}`);
            next();
        });
    };
};

module.exports = upload;
