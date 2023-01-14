import mongoose from "mongoose";
import { GatewayDAO } from "../dao/gateway.dao";
import { HumidityDAO } from "../dao/humidity.dao";
import { TemperatureDAO } from "../dao/temperature.dao";

/**
 * @param {string} ip
 * @param {string} mac
 * @param {{timestamp: number, temperature: number, humidity: number}[]} payload
 * @returns
 */
export async function addGatewayPayload(ip, mac, payload) {
  let gateway = await GatewayDAO.findBySecret(mac);
  if (!gateway) {
    gateway = await GatewayDAO.create({
      name: mac,
      secret: mac,
      ip,
      status: "pending",
    });
  }
  if (gateway.status === "pending") {
    throw new Error(
      "Gateway is in pending state, humidity and tempreture cannot be created"
    );
  }
  if (gateway.ip_address !== ip) {
    throw new Error("Gateway ip address is different from request");
  }
  return await Promise.all(
    payload.map(async ({ timestamp, temperature, humidity }) => [
      await HumidityDAO.create({
        timestamp: new Date(timestamp),
        gateway: new mongoose.Types.ObjectId(gateway.id),
        value: humidity,
      }),
      await TemperatureDAO.create({
        timestamp: new Date(timestamp),
        gateway: new mongoose.Types.ObjectId(gateway.id),
        value: temperature,
      }),
    ])
  );
}
