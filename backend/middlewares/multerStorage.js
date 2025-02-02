const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public");
  },
  filename: function (req, file, cb) {
    const uniquename = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileType = file.originalname.split(".")[1];
    const filenamewithType = `${file.fieldname}-${uniquename}.${fileType}`;
    cb(null, filenamewithType);
  },
});

exports.upload = multer({ storage: storage });
