const mongoose = require("mongoose");

const { Schema } = mongoose;

const HeadingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Heading", HeadingSchema);
