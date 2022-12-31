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

const mockData = async () => {
  const group = await GroupModel.create({ name: "ADMIN" });
  const user = await UserModel.create({
    email: "test@user.cz",
    name: "test",
    surname: "user",
    password: "test@user.cz",
    resetPassword: false,
    groups: [{ _id: group._id, name: group.name }],
  });
  const gateways = [
    {
      name: "Michael's weather station",
      secret: "e4:5f:01:e6:6e:bb",
      owners: [user._id],
      ip_address: "185.100.196.244",
    },
  ];
  await GatewayModel.insertMany(gateways);
};

module.exports = { connectDB, dropDB, dropCollections, mockData };
