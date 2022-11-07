import mongoose, { Schema } from "mongoose";

const ObjectId = Schema.Types.ObjectId;

export const HumiditySchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  gateway: {
    type: ObjectId,
    ref: "gateway",
    required: true,
  },
});

export const HumidityModel = mongoose.model("humidity", HumiditySchema);
