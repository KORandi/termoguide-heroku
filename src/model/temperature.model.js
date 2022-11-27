import mongoose, { Schema } from "mongoose";

const ObjectId = Schema.Types.ObjectId;

export const TemperatureSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  value: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  gateway: {
    type: ObjectId,
    ref: "gateway",
    required: true,
  },
});

export const TemperatureModel = mongoose.model(
  "temperature",
  TemperatureSchema
);
