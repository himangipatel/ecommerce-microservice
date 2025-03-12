const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const authServiceUrl = "http://localhost:3001";
const productServiceUrl = "http://localhost:3002";
const orderServiceUrl = "http://localhost:3003";
const housingServiceUrl = "http://127.0.0.1:8090";

app.use(
  "/product",
  createProxyMiddleware({ target: productServiceUrl, changeOrigin: true })
);
app.use(
  "/auth",
  createProxyMiddleware({ target: authServiceUrl, changeOrigin: true })
);
app.use(
  "/order",
  createProxyMiddleware({ target: orderServiceUrl, changeOrigin: true })
);

app.use(
  "/housing",
  createProxyMiddleware({ target: housingServiceUrl, changeOrigin: true })
);

// Basic route for testing API Gateway
app.get("/", (req, res) => {
  res.send("API Gateway is running");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
