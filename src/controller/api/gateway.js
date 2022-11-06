import { Router } from "express";
import {
  validate,
  validateGatewayMac,
  validateGatewayPayload,
  validateId,
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

  const temperature = await GatewayDAO.getLastTemperatureRecord(id);

  res.json({
    status: 200,
    data: {
      value: !!temperature,
    },
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

// get gateway by id
router.get(
  "/:id",
  authenticate(),
  availableFor(["ADMIN"]),
  async (req, res) => {
    res.json(await GatewayDAO.findByID(req.params.id));
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

export default router;
