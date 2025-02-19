const express = require("express");
const router = express.Router();
const authcontroller = require("../controller/auth");
const { upload } = require("../middlewares/multerStorage");
const { jwtVerify } = require("../middlewares/authmiddleware");

router.post(
  "/register",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  authcontroller.register
);
router.post(
  "/login",

  authcontroller.LoginController
);

router.post("/logout", jwtVerify, authcontroller.logoutHandeler);
module.exports = router;
