const { connectDB, dropDB, dropCollections, mockData } = require("./_db");
const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const { GatewayDAO } = require("../src/dao/gateway.dao");
const { TemperatureModel } = require("../src/model/temperature.model");

describe("gateway api test", () => {
  before(async () => {
    await connectDB();
  });
  after(async () => {
    await dropDB();
  });
  /**
   * @type {{adminGroup: object, adminUser: object, user: object, userGateway: object, gateway: object}}
   */
  let mockedDB;
  beforeEach(async () => {
    mockedDB = await mockData();
  });
  afterEach(async () => {
    await dropCollections();
  });

  describe("testing for admin user", () => {
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
        expect(resp.body).length(2);
      });

      it("should block unauthorized users", async () => {
        await request(app).get("/api/gateway/list").expect(401);
      });
    });

    describe("GET gateway detail", () => {
      it("should return meta data of detail page", async () => {
        const res = await request(app)
          .get(`/api/gateway/${mockedDB.userGateway._id}`)
          .auth(token, { type: "bearer" })
          .expect(200);
        const expected = JSON.parse(
          JSON.stringify(new GatewayDAO({ ...mockedDB.userGateway._doc }))
        );
        expect(res.body?.data).to.deep.equal(expected);
      });

      it("should block unauthorized users", async () => {
        await request(app)
          .get(`/api/gateway/${mockedDB.gateway._id}`)
          .expect(401);
      });

      it("should return error on non object ID type", async () => {
        await request(app)
          .get(`/api/gateway/42`)
          .auth(token, { type: "bearer" })
          .expect(400);
      });

      it("should return null on non existant ID", async () => {
        const res = await request(app)
          .get(`/api/gateway/63af591ab9c4ae3ae9b35eac`)
          .auth(token, { type: "bearer" })
          .expect(200);
        expect(res.body?.data).to.equal(null);
      });
    });

    describe("GET gateway status", () => {
      it("should say if gateway is offline", async () => {
        const res = await request(app)
          .get(`/api/gateway/status/${mockedDB.gateway.id}`)
          .expect(200);
        expect(res.body.data.value).to.equal(false);
      });

      it("should say if gateway is online", async () => {
        await TemperatureModel.create({
          timestamp: Date.now(),
          value: 22.5,
          gateway: mockedDB.gateway._id,
        });
        const res = await request(app)
          .get(`/api/gateway/status/${mockedDB.gateway.id}`)
          .expect(200);
        expect(res.body.data.value).to.equal(true);
      });
    });

    describe("GET humidity", async () => {
      // @todo Create tests
    });

    describe("GET temperature", async () => {
      // @todo Create tests
    });

    describe("POST create gateway", async () => {
      // @todo Create tests
    });

    describe("POST add data", async () => {
      // @todo Create tests
    });

    describe("POST update gateway", async () => {
      // @todo Create tests
    });

    describe("DELETE delete gateway", async () => {
      // @todo Create tests
    });
  });

  describe("testing for casual user", () => {
    let token;
    beforeEach(async () => {
      const resp = await request(app)
        .post("/api/login")
        .send({ password: "user@user.cz", email: "user@user.cz" })
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

    describe("GET gateway detail", () => {
      it("should return meta data of detail page", async () => {
        const res = await request(app)
          .get(`/api/gateway/${mockedDB.userGateway._id}`)
          .auth(token, { type: "bearer" })
          .expect(200);
        const expected = JSON.parse(
          JSON.stringify(new GatewayDAO({ ...mockedDB.userGateway._doc }))
        );
        expect(res.body?.data).to.deep.equal(expected);
      });

      it("should block unauthorized users", async () => {
        await request(app)
          .get(`/api/gateway/${mockedDB.userGateway._id}`)
          .expect(401);
      });

      it("should return error on non object ID type", async () => {
        await request(app)
          .get(`/api/gateway/42`)
          .auth(token, { type: "bearer" })
          .expect(400);
      });

      it("should return access denied on non existant ID", async () => {
        await request(app)
          .get(`/api/gateway/63af591ab9c4ae3ae9b35eac`)
          .auth(token, { type: "bearer" })
          .expect(400);
      });
    });
  });
});
