const express = require("express");
const app = express();
const PORT = process.env.PORT || 3003;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Order = require("./Order");
const isAuthenticated = require("../isAuthenticated");
const amqp = require("amqplib");

var channel, connection;

const MONGO_URL = "mongodb://admin:qwerty@localhost:27017/";
app.use(express.json());

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "order-db",
    });
    console.log("Connected to Order DB");
  } catch (error) {
    console.error("Error connecting to Order DB", error);
    process.exit(1); // Exit the process with failure
  }
}

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
}
connect().then(() => {
  channel.consume("ORDER", (data) => {
    const { products, userEmail } = JSON.parse(data.content);
    const newOrder = createNewOrder(products, userEmail);
    channel.ack(data);
    console.log(newOrder);
    channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
  });
});

connectDB();

const createNewOrder = (products, userEmail) => {
  let total = 0;
  products.forEach((product) => {
    total += product.price;
  });
  const newOrder = new Order({
    products,
    user: userEmail,
    total_price: total,
  });
  newOrder.save();
  return newOrder;
};

app.listen(PORT, () => {
  console.log(`Order service is running on port ${PORT}`);
});
