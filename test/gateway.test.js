const { connectDB, dropDB, dropCollections, mockData } = require("./_db");
const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");

describe("gateway api test", () => {
  before(async () => {
    await connectDB();
  });
  after(async () => {
    await dropDB();
  });
  beforeEach(async () => {
    await mockData();
  });
  afterEach(async () => {
    await dropCollections();
  });

  let token;
  beforeEach(async () => {
    const resp = await request(app)
      .post("/api/login")
      .send({ password: "test@user.cz", email: "test@user.cz" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");
    token = resp.body?.token;
  });

  describe("GET gateway list", () => {
    it("should return array of gateways", async () => {
      const resp = await request(app)
        .get("/api/gateway/list")
        .auth(token, { type: "bearer" });
      expect(resp.body).length(1);
    });

    it("should block unauthorized users", async () => {
      await request(app).get("/api/gateway/list").expect(401);
    });
  });
});
