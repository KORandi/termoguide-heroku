import { AvgTimeRecordDto } from "../dto/avg-time-record.dto.js";
import { TemperatureModel } from "../model/temperature.model.js";

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

  static async getGroupedTempratureByTime(timestamp, interval, limit) {
    const result = await TemperatureModel.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Number(timestamp)) },
        },
      },
      {
        $group: {
          _id: {
            $toDate: {
              $subtract: [
                {
                  $toLong: "$timestamp",
                },
                {
                  $mod: [
                    {
                      $toLong: "$timestamp",
                    },
                    Number(interval),
                  ],
                },
              ],
            },
          },
          average: {
            $avg: {
              $toDecimal: "$value",
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $limit: Number(limit),
      },
      {
        $project: {
          date: "$_id",
          temperatureAvg: {
            $round: ["$average", 1],
          },
        },
      },
    ]);
    return result.map((record) => new AvgTimeRecordDto(record));
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
    if (!result) {
      return null;
    }
    return result;
  }
}
