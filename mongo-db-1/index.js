const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes/route");
const dbconnection = require("./connection/db-connection");

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use("/api", routes);

dbconnection();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
