const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const multer = require('multer');
const bodyParser = require('body-parser');


dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
  }));
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory as buffers
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 1 // Only allow 1 file
    }
  });

app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));

app.use("/api/sites", require("./src/routes/siteRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/orders", require("./src/routes/orderRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));