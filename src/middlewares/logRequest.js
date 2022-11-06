import { LogModel } from "../model/log.model";

export function logRequest(req, res, next) {
  LogModel.create({ body: req.body });
  next();
}
