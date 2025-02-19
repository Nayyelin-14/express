const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profile_photo: {
      type: String,
    },
    cover_photo: {
      type: String,
    },
    refreshtoken: {
      type: String,
    },
    posts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //This checks if the password field has been modified. The isModified("password") method returns true if the password has been changed (or is new), and false if it hasn't been modified.
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// The pre("save") hook is triggered before the document is saved to the database.

///custom method
userSchema.methods.isPasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.AccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESSTOKEN_KEY,
    {
      expiresIn: process.env.ACCESSTOKEN_EXP,
    }
  );
};

userSchema.methods.RefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.REFRESH_TOKEN_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXP,
    }
  );
};

module.exports = mongoose.model("User", userSchema);

// Access Token:

// The access token is a short-lived token used for authentication.
// It is typically used to access protected routes or resources (e.g., API endpoints).
// It expires after a short period (e.g., 15 minutes to 1 hour).
// It should be included in the Authorization header (usually as Bearer <token>).
// Refresh Token:

// The refresh token is a long-lived token used to get a new access token when the original access token expires.
// It allows a user to stay logged in without re-authenticating after the access token expires.
// The refresh token typically has a longer expiration time (e.g., days, weeks).
// It is usually stored securely, as it can be used to generate new access tokens.
