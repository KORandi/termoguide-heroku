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
}

export function validateName(name) {
  if (typeof name !== "string") {
    return "param 'id' is not string";
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
}

export function validateLimit(limit) {
  if (!Number.isInteger(Number(limit))) {
    return "param 'limit' is not number";
  }
}

export function validate(list) {
  return list.filter((el) => el);
}
