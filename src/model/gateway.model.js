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
  },
  owners: [
    {
      type: ObjectId,
      ref: "user",
    },
  ],
});

export const GatewayModel = mongoose.model("gateway", GatewaySchema);
