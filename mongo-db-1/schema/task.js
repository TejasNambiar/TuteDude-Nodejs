const mongoose = require("mongoose");

const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    heading: { type: Schema.Types.ObjectId, ref: "Heading", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
