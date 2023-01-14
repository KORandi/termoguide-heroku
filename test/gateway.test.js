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
          .auth(token, { type: "bearer" })
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
          .auth(token, { type: "bearer" })
          .expect(200);
        expect(res.body.data.value).to.equal(true);
      });
    });

    describe("GET humidity", () => {
      it("should return humidity data", async () => {
        const res = await request(app)
          .get(`/api/gateway/humidity/search`)
          .query({
            interval: 3600000,
            limit: 30,
            gatewayId: String(mockedDB.gateway._id),
          })
          .auth(token, { type: "bearer" })
          .expect(200);
        expect(res.body.data.data).to.have.length(1);
      });

      it("should be disabled for unauthorized user", async () => {
        await request(app)
          .get(`/api/gateway/humidity/search`)
          .query({
            interval: 3600000,
            limit: 30,
            gatewayId: String(mockedDB.gateway._id),
          })
          .expect(401);
      });
    });

    describe("GET temperature", () => {
      it("should return temperature data", async () => {
        const res = await request(app)
          .get("/api/gateway/temperature/search")
          .query({
            interval: 3600000,
            limit: 30,
            gatewayId: String(mockedDB.gateway._id),
          })
          .auth(token, { type: "bearer" })
          .expect(200);
        expect(res.body.data.data).to.have.length(1);
      });
    });

    describe("POST create gateway", () => {
      it("should create gateway record", async () => {
        const resp = await request(app)
          .post("/api/gateway/create")
          .auth(token, { type: "bearer" })
          .send({
            name: "test gateway",
            secret: "e4:5f:01:e6:6e:ff",
            ip_address: "192.168.0.245",
            owners: [mockedDB.user._id],
          })
          .expect(200);
        expect(resp.body.data).to.deep.equal({
          name: "test gateway",
          secret: "e4:5f:01:e6:6e:ff",
          ip_address: "192.168.0.245",
          owners: [String(mockedDB.user._id)],
        });
      });
      it("should deny access", async () => {
        await request(app)
          .post("/api/gateway/create")
          .send({
            name: "test gateway",
            secret: "e4:5f:01:e6:6e:ff",
            ip_address: "192.168.0.245",
            owners: [mockedDB.user._id],
          })
          .expect(401);
      });
    });

    describe("POST update gateway", async () => {
      it("should update gateway record", async () => {
        const resp = await request(app)
          .post("/api/gateway/update")
          .auth(token, { type: "bearer" })
          .send({
            id: mockedDB.gateway._id,
            name: "test gateway",
            ip_address: "192.168.0.245",
            owners: [mockedDB.user._id],
            status: "active",
          })
          .expect(200);
        expect(resp.body.data).to.deep.equal({
          id: String(mockedDB.gateway._id),
          name: "test gateway",
          ip_address: "192.168.0.245",
          owners: [String(mockedDB.user._id)],
          secret: "e4:5f:01:e6:6e:aa",
          status: "active",
        });
      });
      it("should deny access", async () => {
        await request(app)
          .post("/api/gateway/update")
          .send({
            id: mockedDB.gateway._id,
            name: "test gateway",
            secret: "e4:5f:01:e6:6e:ff",
            ip_address: "192.168.0.245",
            owners: [mockedDB.user._id],
          })
          .expect(401);
      });
    });

    describe("DELETE delete gateway", async () => {
      it("should delete gateway record", async () => {
        const resp = await request(app)
          .post("/api/gateway/delete")
          .auth(token, { type: "bearer" })
          .send({
            id: mockedDB.gateway._id,
          })
          .expect(200);
        expect(resp.body.data).to.deep.equal({
          id: String(mockedDB.gateway._id),
          ip_address: mockedDB.gateway.ip_address,
          name: mockedDB.gateway.name,
          owners: mockedDB.gateway.owners,
          secret: mockedDB.gateway.secret,
          status: mockedDB.gateway.status,
        });
      });
      it("should deny access", async () => {
        await request(app)
          .post("/api/gateway/delete")
          .send({
            id: mockedDB.gateway._id,
            name: "test gateway",
            secret: "e4:5f:01:e6:6e:ff",
            ip_address: "192.168.0.245",
            owners: [mockedDB.user._id],
          })
          .expect(401);
      });
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
    describe("GET humidity", () => {
      it("should block user", async () => {
        const res = await request(app)
          .get(`/api/gateway/humidity/search`)
          .query({
            interval: 3600000,
            limit: 30,
            gatewayId: String(mockedDB.gateway._id),
          })
          .auth(token, { type: "bearer" })
          .expect(400);
      });

      it("should return humidity data", async () => {
        const res = await request(app)
          .get(`/api/gateway/humidity/search`)
          .query({
            interval: 3600000,
            limit: 30,
            gatewayId: String(mockedDB.userGateway._id),
          })
          .auth(token, { type: "bearer" })
          .expect(200);
        expect(res.body.data.data).to.have.length(1);
      });
    });

    describe("GET temperature", async () => {
      it("should block user", async () => {
        const res = await request(app)
          .get("/api/gateway/temperature/search")
          .query({
            interval: 3600000,
            limit: 30,
            gatewayId: String(mockedDB.gateway._id),
          })
          .auth(token, { type: "bearer" })
          .expect(400);
      });
    });

    describe("POST add data", async () => {
      it("should create gateway, ignore humidity and temperature records", async () => {
        const res = await request(app)
          .post("/api/gateway/add")
          .send({
            mac: "e4:5f:01:e6:55:55",
            payload: [
              {
                timestamp: Date.now(),
                temperature: 25.5,
                humidity: 25.5,
              },
              {
                timestamp: Date.now() - 1,
                temperature: 25.5,
                humidity: 25.5,
              },
              {
                timestamp: Date.now() - 2,
                temperature: 25.5,
                humidity: 25.5,
              },
            ],
          })
          .expect(400);
      });

      it("should create humidity and temperature records", async () => {
        const res = await request(app)
          .post("/api/gateway/add")
          .send({
            mac: "e4:5f:01:e6:6e:aa",
            payload: [
              {
                timestamp: Date.now(),
                temperature: 25.5,
                humidity: 25.5,
              },
              {
                timestamp: Date.now() - 1,
                temperature: 25.5,
                humidity: 25.5,
              },
              {
                timestamp: Date.now() - 2,
                temperature: 25.5,
                humidity: 25.5,
              },
            ],
          })
          .expect(200);
        expect(res.body.data).to.have.length(3);
      });
    });
  });
});
