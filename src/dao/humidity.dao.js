import mongoose from "mongoose";
import { AvgHumidityListDto } from "../dto/avg-humidity-list.dto.js";
import { AvgHumidityRecordDto } from "../dto/avg-humidity-record.dto.js";
import { AvgTemperatureRecordDto } from "../dto/avg-temperature-record.dto.js";
import { GroupModel } from "../model/group.model.js";
import { HumidityModel } from "../model/humidity.model.js";

function parseToPlainObject(obj) {
  return {
    id: obj._id,
    value: obj.value,
    gateway: obj.gateway,
  };
}

export class HumidityDAO {
  constructor({ id, _id = "", value, gateway }) {
    this.id = id || _id || "";
    this.value = value || "";
    this.gateway = gateway || "";
  }

  /**
   * create group
   */
  static async create(humidity) {
    const result = await HumidityModel.create(humidity);
    return new this(result);
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

  static async getGroupedTempratureByTime(timestamp, interval, limit) {
    const result = await HumidityModel.aggregate([
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
          humidityAvg: {
            $round: ["$average", 1],
          },
        },
      },
      {
        $group: {
          _id: 1,
          data: {
            $push: "$$ROOT",
          },
          min: {
            $min: "$humidityAvg",
          },
          average: {
            $avg: "$humidityAvg",
          },
          max: {
            $max: "$humidityAvg",
          },
        },
      },
      {
        $project: {
          data: 1,
          min: 1,
          max: 1,
          average: { $round: ["$average", 1] },
        },
      },
    ]);
    if (result.length === 0) {
      return null;
    }
    return new AvgHumidityListDto(result[0]);
  }
}
