import { AvgTemperatureListDto } from "../dto/avg-temperature-list.dto.js";
import { TemperatureModel } from "../model/temperature.model.js";
import { getGroupedByTimeQuery } from "../query/getway.query.js";

function parseToPlainObject(obj) {
  return {
    id: obj._id,
    value: obj.value,
    gateway: obj.gateway,
  };
}

export class TemperatureDAO {
  constructor({ id, _id = "", value, gateway }) {
    this.id = id || _id || "";
    this.value = value || "";
    this.gateway = gateway || "";
  }

  /**
   * create group
   */
  static async create(temperature) {
    const result = await TemperatureModel.create(temperature);
    return new this(result);
  }

  /**
   * @param {Number} timestamp
   * @param {Number} interval
   * @param {Number} limit
   * @param {String} gatewayId
   * @returns {Promise<AvgTemperatureListDto>}
   */
  static async getGroupedByTime(timestamp, interval, limit, gatewayId) {
    const result = await TemperatureModel.aggregate(
      getGroupedByTimeQuery({
        gatewayId,
        timestamp,
        interval,
        limit: limit > 1000 ? 1000 : limit,
        type: "temperatures",
      })
    );
    if (result.length === 0) {
      return null;
    }
    return new AvgTemperatureListDto(result[0]);
  }

  /**
   * get group
   */

  /**
   * list all groups
   */
  static async list(gatewayId) {
    const array = await TemperatureModel.find({ gateway: gatewayId });
    if (!array) {
      return null;
    }
    const result = array.map((obj) => new this(parseToPlainObject(obj)));
    return result;
  }

  /**
   * update group
   */

  /**
   * delete study programme
   */

  static async getLastRecordGreaterThanSixMinutes(gatewayId) {
    const currentDate = Date.now();
    const beforeSixMinutes = currentDate - 6 * 60 * 1000;
    const result = await TemperatureModel.find({
      timestamp: { $gt: beforeSixMinutes },
      gateway: gatewayId,
    })
      .sort({ timestamp: -1 })
      .limit(1);
    if (!result.length) {
      return null;
    }
    return result;
  }
}
