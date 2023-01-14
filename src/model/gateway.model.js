import mongoose, { Schema } from "mongoose";

const ObjectId = Schema.Types.ObjectId;

export const GatewaySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  secret: {
    type: String,
    required: true,
  },
  ip_address: {
    type: String,
    required: true,
  },
  owners: [
    {
      type: ObjectId,
      ref: "user",
    },
  ],
  status: {
    type: String,
    enum: ["pending", "active", "disabled"],
    default: "active",
  },
});

export const GatewayModel = mongoose.model("gateway", GatewaySchema);
