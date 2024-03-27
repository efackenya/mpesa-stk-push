const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const mpesa = require("./routes/mpesa.routes");
dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server Health Is Okay");
});

app.use("/mpesa", mpesa);

const PORT = process.env.PORT || 6000;
app.listen(PORT, async () => {
  console.log(`Server is running http://localhost:${PORT}`);
});
