import mongoose from "mongoose";
import { GatewayModel } from "../model";

export class GatewayDAO {
  /**
   * @param {{
   *  id?: string,
   *  _id?: string,
   *  name?: string,
   *  secret?: string,
   *  owners?: string[]
   *  ip_address?: string
   * }} param0
   */
  constructor({ id, _id, name, secret, owners, ip_address }) {
    /**
     * @type {string}
     */

    this.id = id || _id || "";
    /**
     * @type {string}
     */
    this.secret = secret || "";

    /**
     * @type {string}
     */
    this.name = name || "";

    /**
     * @type {string[]}
     */
    this.owners = owners || [];

    this.ip_address = ip_address || "";
  }

  /**
   * create gateway
   */
  static async create(gateway) {
    const result = await GatewayModel.create(gateway);
    return new this(result);
  }

  /**
   * @param {string} id
   * @returns {Promise<GatewayDAO | null>}
   */
  static async findByID(id) {
    const gateway = await GatewayModel.findOne({
      _id: id,
    });
    if (!gateway) {
      return null;
    }
    return new this(gateway);
  }

  /**
   * @param {string} id
   * @returns {Promise<GatewayDAO | null>}
   */
  static async findByIdAndOwner(id, owner) {
    const gateway = await GatewayModel.findOne({
      _id: id,
      owners: new mongoose.Types.ObjectId(owner),
    });
    if (!gateway) {
      return null;
    }
    return new this(gateway);
  }

  /**
   * @param {string} secret
   * @returns {Promise<GatewayDAO | null>}
   */
  static async findBySecret(secret) {
    const gateway = await GatewayModel.findOne({
      secret,
    });
    if (!gateway) {
      return null;
    }
    return new this(gateway);
  }

  /**
   * returns list of gateways
   */
  static async list(user) {
    if (!user) {
      return [];
    }
    let array = [];
    if (user.groups.some((group) => group.name === "ADMIN")) {
      array = await GatewayModel.find();
    } else {
      array = await GatewayModel.find({ owners: user.id });
    }
    if (!array) {
      return null;
    }
    const result = array.map((obj) => new this(obj));
    return result;
  }

  /**
   * update gateway
   */
  static async update(id, data) {
    const result = await GatewayModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });
    return new this(result);
  }

  /**
   * delete gateway
   */
  static async delete(id) {
    const result = await GatewayModel.findByIdAndDelete(id);
    return new this(result);
  }
}
