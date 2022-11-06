import mongoose, { Schema } from "mongoose";

const ObjectId = Schema.Types.ObjectId;

export const HumiditySchema = new Schema({
  timestap: {
    type: Date,
    default: Date.now,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  gateway: {
    type: {
      _id: {
        type: ObjectId,
        ref: "gateway",
      },
      name: String,
    },
    required: true,
  },
});

export const HumidityModel = mongoose.model("humidity", HumiditySchema);
