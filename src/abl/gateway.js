import mongoose from "mongoose";

export function validateGatewayMac(mac) {
  if (!mac) {
    return "'mac' field is not set";
  }
  if (typeof mac !== "string") {
    return "'mac' field is not set";
  }
}

export function validateGatewayPayload(payload) {
  if (!payload) {
    return "'payload' field is not set";
  }
  payload.forEach((load) => {
    if (!load.timestamp) {
      return "'timestamp' in payload element is not set";
    }
    if (!Number.isInteger(load.timestamp)) {
      return "'timestamp' in payload element is not number";
    }
    if (!load.temperature) {
      return "'temperature' in payload element is not set";
    }
    if (Number.isNaN(load.temperature)) {
      return "'timestamp' in payload element is not number";
    }
    if (!load.humidity) {
      return "'humidity' in payload element is not set";
    }
    if (Number.isNaN(load.humidity)) {
      return "'timestamp' in payload element is not number";
    }
  });
}

export function validateId(id) {
  if (typeof id !== "string") {
    return "param 'id' is not string";
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return "param 'id' is not type object id";
  }
}

export function validateName(name) {
  if (typeof name !== "string") {
    return "param 'name' is not string";
  }
}

export function validateOwners(owners) {
  if (!Array.isArray(owners)) {
    return "param 'owners' is not array";
  }
  if (!owners.every((owner) => typeof owner === "string")) {
    return "param 'owners' is not string array";
  }
}

export function validateIP(ip_address) {
  if (typeof ip_address !== "string") {
    return "param 'ip_address' is not string";
  }
  if (
    !ip_address.match(
      /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/
    )
  ) {
    return "param 'ip_address' is not ip address";
  }
}

export function validateStatus(status) {
  if (typeof status !== "string") {
    return "param 'status' is not string";
  }
  if (!["pending", "active", "disabled"].includes(status)) {
    return "param 'status' is not pending, active or disabled";
  }
}

export function validateMAC(mac_address) {
  if (typeof mac_address !== "string") {
    return "param 'mac_address' is not string";
  }
  if (!mac_address.match(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/)) {
    return "param 'mac_address' is not ip address";
  }
}

export function validateDate(date) {
  if (typeof date === "undefined") {
    return;
  }
  if (!Number.isInteger(Number(date))) {
    return "param 'date' is not timestamp";
  }
}

export function validateInterval(interval) {
  if (!Number.isInteger(Number(interval))) {
    return "param 'interval' is not number";
  }
  if (interval < 60000) {
    return "param 'interval' is less than 1 minute";
  }
}

export function validateLimit(limit) {
  if (!Number.isInteger(Number(limit))) {
    return "param 'limit' is not number";
  }
}

/**
 * @param {Array<any>} list
 * @returns {Array<any>}
 */
export function validate(list) {
  return list.filter((el) => el);
}
