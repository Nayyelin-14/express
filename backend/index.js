const express = require("express");
const cookieparser = require("cookie-parser");
const { connection } = require("./db/coneection");
const app = express();
const PORT = process.env.PORT || 8000;
const authRoutes = require("./routes/auth");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieparser());
app.use("/api/v1/", authRoutes);
connection().then(() =>
  app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
    console.log("Database connected");
  })
);
