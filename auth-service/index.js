const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const mongoose = require("mongoose");
const User = require("./User");
const jwt = require("jsonwebtoken");
const MONGO_URL = "mongodb://admin:qwerty@localhost:27017/";
app.use(express.json());

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "auth-db",
    });
    console.log("Connected to Auth DB");
  } catch (error) {
    console.error("Error connecting to Auth DB", error);
    process.exit(1); // Exit the process with failure
  }
}

connectDB();

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User doesn't exist" });
  } else {
    //check if enter pass is  valid
    if (password !== user.password) {
      return res.json({ message: "Invalid password" });
    }

    const payload = {
      email,
      name: user.name,
    };

    jwt.sign(payload, "secret", (err, token) => {
      if (err) console.log(err);
      else {
        return res.json({ token: token });
      }
    });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.json({ message: "User already exists" });
  } else {
    const user = new User({ name, email, password });
    user.save();
    return res.json(user);
  }
});
