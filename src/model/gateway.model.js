import mongoose, { Schema } from "mongoose";

export const GatewaySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
});

export const GatewayModel = mongoose.model("gateway", GatewaySchema);
