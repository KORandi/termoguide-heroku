const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { UserModel, GroupModel, GatewayModel } = require("../src/model");

let mongo = null;
const connectDB = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri, {
    //@ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const dropDB = async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
};

const dropCollections = async () => {
  if (mongo) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
};

/**
 * @returns { Promise<{
 *  adminGroup: object,
 *  adminUser: object,
 *  user: object,
 *  userGateway: object
 *  gateway: object
 * }>}
 */
const mockData = async () => {
  const adminGroup = await GroupModel.create({ name: "ADMIN" });
  const userGroup = await GroupModel.create({ name: "USER" });
  const adminUser = await UserModel.create({
    email: "test@user.cz",
    name: "test",
    surname: "user",
    password: "test@user.cz",
    resetPassword: false,
    groups: [{ _id: adminGroup._id, name: adminGroup.name }],
  });
  const user = await UserModel.create({
    email: "user@user.cz",
    name: "user",
    surname: "user",
    password: "user@user.cz",
    resetPassword: false,
    groups: [{ _id: userGroup._id, name: userGroup.name }],
  });
  const userGateway = await GatewayModel.create({
    name: "Michael's weather station",
    secret: "e4:5f:01:e6:6e:bb",
    owners: [user._id],
    ip_address: "192.168.0.244",
  });
  const gateway = await GatewayModel.create({
    name: "Jan's weather station",
    secret: "e4:5f:01:e6:6e:aa",
    owners: [],
    ip_address: "192.168.0.245",
  });
  return { adminGroup, adminUser, user, userGateway, gateway };
};

module.exports = { connectDB, dropDB, dropCollections, mockData };
