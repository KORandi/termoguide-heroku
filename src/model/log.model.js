import mongoose, { Schema } from "mongoose";

export const LogSchema = new Schema({
  body: {
    type: Object,
  },
  headers: {
    type: Object,
  },
  ip: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const LogModel = mongoose.model("log", LogSchema);
