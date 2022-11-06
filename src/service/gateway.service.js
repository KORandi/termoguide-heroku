import { GatewayDAO } from "../dao/gateway.dao";
import { HumidityDAO } from "../dao/humidity.dao";
import { TemperatureDAO } from "../dao/temperature.dao";
import { ObjectId } from "mongodb";

/**
 *
 * @param {string} mac
 * @param {{timestamp: number, temperature: number, humidity: number}[]} payload
 * @returns
 */
export async function addGatewayPayload(mac, payload) {
  let gateway = await GatewayDAO.findBySecret(mac);
  if (!gateway) {
    gateway = await GatewayDAO.create({
      name: mac,
      secret: mac,
    });
  }
  await Promise.all(
    payload.map(async ({ timestamp, temperature, humidity }) => [
      await HumidityDAO.create({
        timestamp: new Date(timestamp),
        //@ts-ignore
        gateway: ObjectId(gateway.id),
        value: humidity,
      }),
      await TemperatureDAO.create({
        timestamp: new Date(timestamp),
        //@ts-ignore
        gateway: ObjectId(gateway.id),
        value: temperature,
      }),
    ])
  );
}
