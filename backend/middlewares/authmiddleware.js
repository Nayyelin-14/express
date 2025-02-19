const jwt = require("jsonwebtoken");
const user = require("../models/user");
exports.jwtVerify = async (req, res, next) => {
  const incomingAccessToken =
    req.cookies.ACCESSTOKEN || req.header("Authorization");
  console.log(incomingAccessToken);
  if (!incomingAccessToken) {
    return res.status(401).json({
      message: "Unthorized",
    });
  }

  try {
    const decodeToken = jwt.decode(incomingAccessToken);
    console.log(decodeToken);
    if (!decodeToken._id) {
      return res.status(401).json({
        message: "Unthorized",
      });
    }
    const existingUser = await user
      .findById(decodeToken._id)
      .select("-password -refreshtoken");
    if (!existingUser) {
      return res.status(401).json({
        message: "Unthorized",
      });
    }
    req.user = existingUser;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error occured",
    });
  }
};
