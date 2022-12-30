import { Router } from "express";
import {
  validate,
  validateDate,
  validateGatewayMac,
  validateGatewayPayload,
  validateId,
  validateInterval,
  validateLimit,
  validateName,
  validateOwners,
} from "../../abl/gateway";
import { GatewayDAO } from "../../dao/gateway.dao";
import { HumidityDAO } from "../../dao/humidity.dao";
import { TemperatureDAO } from "../../dao/temperature.dao";
import { logRequest } from "../../middlewares/logRequest";
import { addGatewayPayload } from "../../service/gateway.service";
import { authenticate, availableFor } from "../../utils";

const router = Router();

// create gateway
router.post(
  "/create",
  authenticate(),
  availableFor(["ADMIN"]),
  async (req, res) => {
    res.json(await GatewayDAO.create(req.body));
  }
);

router.post("/add", logRequest, async (req, res) => {
  const { mac, payload } = req.body;

  const errors = validate([
    validateGatewayMac(mac),
    validateGatewayPayload(payload),
  ]);

  const forwardedFor = req.headers["x-forwarded-for"];

  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor || req.socket.remoteAddress;

  if (errors.length) {
    res.status(400);
    res.json({
      status: 400,
      errors,
      data: req.body,
    });
    return;
  }

  await addGatewayPayload(ip, mac, payload);

  res.json({
    status: 200,
    data: req.body,
  });
});

router.get(
  "/temperature/search",
  authenticate(),
  availableFor(["$_OWNER"]),
  async function (req, res) {
    const { interval, date = 0, limit = 10, gatewayId } = req.query;

    const errors = validate([
      validateDate(date),
      validateInterval(interval),
      validateLimit(limit),
      validateId(gatewayId),
    ]);

    if (errors.length) {
      res.status(400);
      res.json({
        status: 400,
        errors,
        data: req.params,
      });
      return;
    }

    const data = await TemperatureDAO.getGroupedByTime(
      Number(date),
      Number(interval),
      Number(limit),
      String(gatewayId)
    );

    res.json({
      status: 200,
      data,
    });
  }
);

router.get(
  "/humidity/search",
  authenticate(),
  availableFor(["$_OWNER"]),
  async function (req, res) {
    const { interval, date = 0, limit = 10, gatewayId } = req.query;

    const errors = validate([
      validateDate(date),
      validateInterval(interval),
      validateLimit(limit),
      validateId(gatewayId),
    ]);

    if (errors.length) {
      res.status(400);
      res.json({
        status: 400,
        errors,
        data: req.params,
      });
      return;
    }

    const data = await HumidityDAO.getGroupedByTime(
      Number(date),
      Number(interval),
      Number(limit),
      String(gatewayId)
    );

    res.json({
      status: 200,
      data,
    });
  }
);

router.get("/status/:id", async function (req, res) {
  const { id } = req.params;

  const errors = validate([validateId(id)]);

  if (errors.length) {
    res.status(400);
    res.json({
      status: 400,
      errors,
      data: req.body,
    });
    return;
  }

  const temperature =
    await await TemperatureDAO.getLastRecordGreaterThanSixMinutes(id);

  res.json({
    status: 200,
    data: {
      value: !!temperature,
    },
  });
});

// list all gateways
router.get("/list", authenticate(), async (req, res) => {
  res.json(await GatewayDAO.list(req.user));
});

// update gateway
router.post(
  "/update",
  authenticate(),
  availableFor(["ADMIN"]),
  async (req, res) => {
    const { owners, name, id } = req.body;
    const errors = validate([
      validateName(name),
      validateId(id),
      validateOwners(owners),
    ]);

    if (errors.length) {
      res.status(400);
      res.json({
        status: 400,
        errors,
        data: req.body,
      });
      return;
    }

    try {
      await GatewayDAO.update(id, { name, owners });
    } catch (error) {
      res.status(400);
      res.json({
        status: 400,
        errors: [error.message],
        data: req.body,
      });
      return;
    }

    res.json({
      status: 200,
      data: req.body,
    });
  }
);

// delete
router.post(
  "/delete",
  authenticate(),
  availableFor(["ADMIN"]),
  async (req, res) => {
    res.json(await GatewayDAO.delete(req.body.id));
  }
);

// get gateway by id
router.get(
  "/:id",
  authenticate(),
  availableFor(["ADMIN"]),
  async (req, res) => {
    const data = await GatewayDAO.findByID(req.params.id);
    res.json({
      status: 200,
      data,
    });
  }
);

export default router;
