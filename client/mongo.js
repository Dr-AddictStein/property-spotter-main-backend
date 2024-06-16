const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(
  "mongodb+srv://property-spotter:4g92iSBTABQWpF1H@cluster0.6nxonq0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  }
);

module.exports = client;
