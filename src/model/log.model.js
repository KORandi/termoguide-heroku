import mongoose, { Schema } from "mongoose";

export const LogSchema = new Schema({
  body: {
    type: Object,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const LogModel = mongoose.model("log", LogSchema);
