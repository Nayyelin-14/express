const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },

    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  },
  {
    timestamps: true,
  }
);
export const Comment = mongoose.Schema("Comment", commentSchema);
