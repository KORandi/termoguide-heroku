import mongoose from "mongoose";
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
}
