const client = require("../client/mongo");

const userCollection = client.db("property-spotter").collection("user");
module.exports = userCollection;







