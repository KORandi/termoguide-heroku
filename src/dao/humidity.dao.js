import { AvgHumidityListDto } from "../dto/avg-humidity-list.dto.js";
import { HumidityModel } from "../model/humidity.model.js";
import { getGroupedByTimeQuery } from "../query/getway.query.js";

function parseToPlainObject(obj) {
  return {
    id: obj._id,
    value: obj.value && Number(obj.value),
    gateway: obj.gateway,
  };
}

export class HumidityDAO {
  constructor({ id, _id = "", value, gateway }) {
    this.id = id || _id || undefined;
    this.value = value || 0;
    this.gateway = gateway || "";
    this.type = "humidity";
  }

  /**
   * create group
   */
  static async create(humidity) {
    const result = await HumidityModel.create(humidity);
    return new this(parseToPlainObject(result));
  }

  /**
   * get group
   */

  /**
   * list all groups
   */
  static async list(gatewayId) {
    const array = await HumidityModel.find({ gateway: gatewayId });
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

  /**
   *
   * @param {Number} timestamp
   * @param {Number} interval
   * @param {Number} limit
   * @param {String} gatewayId
   * @returns {Promise<AvgHumidityListDto>}
   */
  static async getGroupedByTime(timestamp, interval, limit, gatewayId) {
    const result = await HumidityModel.aggregate(
      getGroupedByTimeQuery({
        gatewayId,
        timestamp,
        interval,
        limit: limit > 1000 ? 1000 : limit,
        type: "humidities",
      })
    );
    if (result.length === 0) {
      return null;
    }
    return new AvgHumidityListDto(result[0]);
  }
}
