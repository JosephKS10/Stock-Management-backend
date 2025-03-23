const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/sites", require("./src/routes/siteRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/orders", require("./src/routes/orderRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));