import { Router } from "express";
import {
  validate,
  validateDate,
  validateGatewayMac,
  validateGatewayPayload,
  validateId,
  validateInterval,
  validateLimit,
} from "../../abl/gateway";
import { GatewayDAO } from "../../dao/gateway.dao";
import { HumidityDAO } from "../../dao/humidity.dao";
import { TemperatureDAO } from "../../dao/temperature.dao";
import { logRequest } from "../../middlewares/logRequest";
import { HumidityModel } from "../../model/humidity.model";
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

  if (errors.length) {
    res.status(400);
    res.json({
      status: 400,
      errors,
      data: req.body,
    });
    return;
  }

  await addGatewayPayload(mac, payload);

  res.json({
    status: 200,
    data: req.body,
  });
});

router.get("/temperature/:id", async function (req, res) {
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

  const temperatures = await TemperatureDAO.list(id);

  res.json({
    status: 200,
    data: {
      temperatures,
    },
  });
});

router.get("/humidity/:id", async function (req, res) {
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

  const humidities = await HumidityDAO.list(id);

  res.json({
    status: 200,
    data: {
      humidities,
    },
  });
});

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

router.get("/temperature/:date/:interval/:limit?", async function (req, res) {
  const { date, interval, limit = 10 } = req.params;

  const errors = validate([
    validateDate(date),
    validateInterval(interval),
    validateLimit(limit),
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

  const data = await TemperatureDAO.getGroupedTempratureByTime(
    date,
    interval,
    limit
  );

  res.json({
    status: 200,
    data,
  });
});

router.get("/humidity/:date/:interval/:limit?", async function (req, res) {
  const { date, interval, limit = 10 } = req.params;

  const errors = validate([
    validateDate(date),
    validateInterval(interval),
    validateLimit(limit),
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

  const data = await HumidityDAO.getGroupedTempratureByTime(
    date,
    interval,
    limit
  );

  res.json({
    status: 200,
    data,
  });
});

// list all gateways
router.get(
  "/list",
  authenticate(),
  availableFor(["ADMIN", "STUDENT", "TEACHER"]),
  async (req, res) => {
    res.json(await GatewayDAO.list());
  }
);

// update gateway
router.post(
  "/update",
  authenticate(),
  availableFor(["ADMIN"]),
  async (req, res) => {
    res.json(await GatewayDAO.update(req.body));
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
    res.json(await GatewayDAO.findByID(req.params.id));
  }
);

export default router;
