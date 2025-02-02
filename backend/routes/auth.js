const express = require("express");
const router = express.Router();
const authcontroller = require("../controller/auth");
const { upload } = require("../middlewares/multerStorage");

router.post(
  "/register",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  authcontroller.register
);

module.exports = router;
