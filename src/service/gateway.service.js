import { GatewayDAO } from "../dao/gateway.dao";
import { HumidityDAO } from "../dao/humidity.dao";
import { TemperatureDAO } from "../dao/temperature.dao";

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
  payload.forEach(async ({ timestamp, temperature, humidity }) => {
    await HumidityDAO.create({
      timestamp: new Date(timestamp),
      gateway: gateway.id,
      humidity,
    });
    await TemperatureDAO.create({
      timestamp: new Date(timestamp),
      gateway: gateway.id,
      temperature,
    });
  });
}
