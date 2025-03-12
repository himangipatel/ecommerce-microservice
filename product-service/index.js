const express = require("express");
const app = express();
const PORT = process.env.PORT || 3002;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Product = require("./Product");
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
      dbName: "product-db",
    });
    console.log("Connected to Product DB");
  } catch (error) {
    console.error("Error connecting to Product DB", error);
    process.exit(1); // Exit the process with failure
  }
}

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
}
connect();

connectDB();

// Get all products
app.get("/getAllProducts", async (req, res) => {
  const products = await Product.find();
  return res.json(products);
});

app.post("/create", isAuthenticated, async (req, res) => {
  const { name, description, price, image } = req.body;
  const newProduct = new Product({
    name,
    description,
    price,
    image,
  });
  newProduct.save();
  return res.json(newProduct);
});

app.post("/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  let order;
  channel.sendToQueue(
    "ORDER",
    Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    )
  );
  const getOrder = () => {
    return new Promise((resolve, reject) => {
      channel.consume(
        "PRODUCT",
        (data) => {
          const order = JSON.parse(data.content);
          resolve(order);
        },
        { noAck: true }
      );
    });
  };

  try {
    const order = await getOrder();
    let whole_products = [];
    order.newOrder.products.forEach(async (product) => {
      // console.log(product._id);
      return products.forEach(async (p) => {
        if (p._id.toString() === product._id.toString()) {
          console.log("Product found", p);
          whole_products.push(p);
        }
      });
    });
    // order.newOrder.products = whole_products;
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ error: "Failed to process order" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
});
