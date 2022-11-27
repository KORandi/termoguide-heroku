import { GatewayModel } from "../model";

export class GatewayDAO {
  /**
   * @param {{
   *  id?: string,
   *  _id?: string,
   *  name?: string,
   *  secret?: string,
   * }} param0
   */
  constructor({ id, _id, name, secret }) {
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
  }

  /**
   * create user
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
   * list all users
   */
  static async list() {
    const array = await GatewayModel.find();
    if (!array) {
      return null;
    }
    const result = array.map((obj) => new this(obj));
    return result;
  }

  /**
   * update user
   */
  static async update(id, data) {
    const result = await GatewayModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });
    return new this(result);
  }

  /**
   * delete user
   */
  static async delete(id) {
    const result = await GatewayModel.findByIdAndDelete(id);
    return new this(result);
  }
}
