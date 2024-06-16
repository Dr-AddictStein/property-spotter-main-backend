const express = require("express");
const mongoose = require('mongoose')
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const userController = require("./controllers/user_controllers");
const houseRouter = require('./router/router');
const spotterRegistration = require('./router/router');
const { router } = require('./controllers/spotter-controler');
const manageAreaRoute = require('./router/router');
const manageAgentRoute = require('./router/router');
const manageAgencyRoute = require('./router/router');
const messageRoute = require('./router/router');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
require("dotenv").config();


app.use("/", userController);
app.use("/house", houseRouter);
app.use("/spotter", spotterRegistration);
app.use("/area", manageAreaRoute);
app.use("/agency", manageAgencyRoute);
app.use("/agent", manageAgentRoute);
app.use("/message", messageRoute);
app.use(router);

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.DB, { dbName: 'property-spotter' });
    console.log('DB connect successfully');
  } catch (error) {
    console.log(error.message);
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  connectDB();
  console.log('server runing well on 5000 port');
});
