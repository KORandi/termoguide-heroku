import { LogModel } from "../model/log.model";

export function logRequest(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  LogModel.create({ body: req.body, ip });
  next();
}
