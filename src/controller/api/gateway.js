import { Router } from "express";
import {
  validate,
  validateGatewayMac,
  validateGatewayPayload,
} from "../../abl/gateway";
import { GatewayDAO } from "../../dao/gateway.dao";
import { addGatewayPayload } from "../../service/gateway.service";
import { authenticate, availableFor } from "../../utils";

const router = Router();

// create user
router.post(
  "/create",
  authenticate(),
  availableFor(["ADMIN"]),
  async (req, res) => {
    res.json(await GatewayDAO.create(req.body));
  }
);

router.post("/add", async (req, res) => {
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

  addGatewayPayload(mac, payload);

  res.json({
    status: 200,
    data: req.body,
  });
});

// list all users
router.get(
  "/list",
  authenticate(),
  availableFor(["ADMIN", "STUDENT", "TEACHER"]),
  async (req, res) => {
    res.json(await GatewayDAO.list());
  }
);

// get user by id
router.get(
  "/:id",
  authenticate(),
  availableFor(["ADMIN"]),
  async (req, res) => {
    res.json(await GatewayDAO.findByID(req.params.id));
  }
);

// update user
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
